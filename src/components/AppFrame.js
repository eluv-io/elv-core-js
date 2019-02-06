/* AppFrame

This is a sandboxed frame that includes a message passing interface
to allow the contained app to request fabric / blockchain API requests
from the core app, which owns user account information and keys
*/

import React from "react";
import connect from "react-redux/es/connect/connect";
import Path from "path";
import {UpdateAccountBalance} from "../actions/Accounts";
import Authenticate from "./Authenticate";
import {GetAppLocation, HideHeader, SetAppLocation, ShowHeader} from "../actions/Routing";
import Redirect from "react-router/es/Redirect";

import { FrameClient } from "elv-client-js/src/FrameClient";

// Ensure error objects can be properly serialized in messages
if (!("toJSON" in Error.prototype)) {
  const excludedAttributes = [
    "columnNumber",
    "fileName",
    "lineNumber"
  ];

  Object.defineProperty(Error.prototype, "toJSON", {
    value: function() {
      let object = {};

      Object.getOwnPropertyNames(this).forEach(key => {
        if(!excludedAttributes.includes(key)) {
          object[key] = this[key];
        }
      }, this);

      return object;
    },
    configurable: true,
    writable: true
  });
}

class IFrameBase extends React.Component {
  SandboxPermissions() {
    return [
      "allow-scripts",
      "allow-forms",
      "allow-modals",
      "allow-pointer-lock",
      "allow-orientation-lock",
      "allow-popups",
      "allow-presentation"
    ].join(" ");
  }

  shouldComponentUpdate() { return false; }

  componentDidMount() {
    window.addEventListener("message", this.props.listener);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.props.listener);
  }

  render() {
    return (
      <iframe
        ref={this.props.appRef}
        src={this.props.appUrl}
        sandbox={this.SandboxPermissions()}
        className={this.props.className}
      />
    );
  }
}

const IFrame = React.forwardRef(
  (props, appRef) => <IFrameBase appRef={appRef} {...props} />
);

const IsCloneable = (value) => {
  if(Object(value) !== value) {
    // Primitive valueue
    return true;
  }
  
  switch({}.toString.call(value).slice(8,-1)) { // Class
    case "Boolean":     
    case "Number":      
    case "String":      
    case "Date":
    case "RegExp":      
    case "Blob":        
    case "FileList":
    case "ImageData":   
    case "ImageBitmap": 
    case "ArrayBuffer":
      return true;
    case "Array":
    case "Object":
      return Object.keys(value).every(prop => IsCloneable(value[prop]));
    case "Map":
      return [...value.keys()].every(IsCloneable)
        && [...value.values()].every(IsCloneable);
    case "Set":
      return [...value.keys()].every(IsCloneable);
    default:
      return false;
  }
};

class AppFrame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      appRef: React.createRef(),
      loginRequired: false,
      redirectLocation: "",
      basePath: Path.join("/apps", this.props.match.params.appName)
    };

    this.ApiRequestListener = this.ApiRequestListener.bind(this);
  }

  // Make request to update the current user's account balance
  // Debounce to reduce unnecessary requests when multiple calls are made
  UpdateAccountBalance() {
    if(this.state.balanceUpdateTimeout) {
      clearTimeout(this.state.balanceUpdateTimeout);
    }

    const timeout = setTimeout(() => {
      this.props.dispatch(
        UpdateAccountBalance({
          client: this.props.client.client,
          accountManager: this.props.accounts.accountManager,
          accountAddress: this.props.accounts.currentAccount.accountAddress
        })
      );

      this.setState({balanceUpdateTimeout: undefined});
    }, 1000);

    this.setState({
      balanceUpdateTimeout: timeout
    });
  }

  Respond(event, responseMessage) {
    responseMessage = {
      ...responseMessage,
      requestId: event.data.requestId,
      type: "ElvFrameResponse"
    };

    // If the response is not cloneable, serialize it to remove any non-cloneable parts
    if(!IsCloneable(responseMessage)) {
      responseMessage = JSON.parse(JSON.stringify(responseMessage));
    }

    try {
      // Try sending the response message as-is
      event.source.postMessage(
        responseMessage,
        "*"
      );
    } catch(error) {
      /* eslint-disable no-console */
      console.error(responseMessage);
      console.error(error);
      /* eslint-enable no-console */
    }
  }

  async CheckAccess(event) {
    if(FrameClient.PromptedMethods().includes(event.data.calledMethod)) {
      const accessLevel = await this.props.client.client.userProfile.AccessLevel();

      // No access to private profiles
      if(accessLevel === "private") {return false;}

      // Prompt for access
      if(accessLevel === "prompt") {
        const requestor = event.data.args.requestor;
        if(!requestor) {
          console.error("Requestor must be specified when requesting access to a user profile");
          return false;
        }

        const accessAllowed = await this.props.client.client.userProfile.PrivateUserMetadata({
          metadataSubtree: Path.join("allowed_accessors", requestor)
        });

        if(accessAllowed) { return true; }

        if(!confirm(`Do you want to allow the application "${requestor}" to access your profile?`)) {
          return false;
        }

        // Record permission
        await this.props.client.client.userProfile.ReplacePrivateUserMetadata({
          metadataSubtree: Path.join("allowed_accessors", requestor),
          metadata: Date.now()
        });
      }

      // Otherwise public access
    }

    return true;
  }

  // Listen for API request messages from frame
  // TODO: Validate origin
  async ApiRequestListener(event) {
    // Ignore unrelated messages
    if(!event || !event.data || event.data.type !== "ElvFrameRequest") { return; }

    switch(event.data.operation) {
      // App requested its app path
      case "GetFramePath":
        this.Respond(event, {response: GetAppLocation({basePath: this.state.basePath})});
        break;

      // App requested to push its new app path
      case "SetFramePath":
        SetAppLocation({
          basePath: this.state.basePath,
          appPath: event.data.path || "/"
        });
        this.Respond(event, {response: "Set path " + event.data.path});
        break;

      case "ShowAccountsPage":
        this.setState({
          redirectLocation: "/accounts"
        });
        break;

      case "ShowHeader":
        this.props.dispatch(ShowHeader());
        break;

      case "HideHeader":
        this.props.dispatch(HideHeader());
        break;

      // App requested an ElvClient method
      default:
        if(!(await this.CheckAccess(event))) {
          this.Respond(event, {error: new Error("Access denied")});
          return;
        }

        this.Respond(event, await this.props.client.client.CallFromFrameMessage(event.data));
    }


    this.UpdateAccountBalance();
  }

  render() {
    if(this.state.redirectLocation) {
      return <Redirect push to={this.state.redirectLocation} />;
    }

    // TODO: Don't hardcode this
    const appUrl = "http://localhost:8080";

    return (
      <IFrame
        ref={this.state.appRef}
        appUrl={appUrl}
        listener={this.ApiRequestListener}
        className="app-frame"
      />
    );
  }
}


export default connect(
  (state) => state
)(Authenticate(AppFrame));
