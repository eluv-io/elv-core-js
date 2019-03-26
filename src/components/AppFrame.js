/* AppFrame

This is a sandboxed frame that includes a message passing interface
to allow the contained app to request fabric / blockchain API requests
from the core app, which owns user account information and keys
*/

import React from "react";
import Path from "path";
import Redirect from "react-router/es/Redirect";

import { FrameClient } from "elv-client-js/src/FrameClient";

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
        title={`Eluvio Core Application: ${this.props.appName}`}
        ref={this.props.appRef}
        src={this.props.appUrl}
        sandbox={this.SandboxPermissions()}
        className={this.props.className}
        allowFullScreen={true}
      />
    );
  }
}

const IFrame = React.forwardRef(
  (props, appRef) => <IFrameBase appRef={appRef} {...props} />
);

class AppFrame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      appRef: React.createRef(),
      // TODO: pull directly out of props
      basePath: Path.join("/apps", this.props.app.name)
    };

    this.ApiRequestListener = this.ApiRequestListener.bind(this);
  }

  async CheckAccess(event) {
    if(FrameClient.PromptedMethods().includes(event.data.calledMethod)) {
      const accessLevel = await this.props.client.userProfile.AccessLevel();

      // No access to private profiles
      if(accessLevel === "private") {return false;}

      // Prompt for access
      if(accessLevel === "prompt") {
        const requestor = event.data.args.requestor;
        if(!requestor) {
          /* eslint-disable no-console */
          console.error("Requestor must be specified when requesting access to a user profile");
          /* eslint-enable no-console */
          return false;
        }

        const accessAllowed = await this.props.client.userProfile.PrivateUserMetadata({
          metadataSubtree: Path.join("allowed_accessors", requestor)
        });

        if(accessAllowed) { return true; }

        if(!confirm(`Do you want to allow the application "${requestor}" to access your profile?`)) {
          return false;
        }

        // Record permission
        await this.props.client.userProfile.ReplacePrivateUserMetadata({
          metadataSubtree: Path.join("allowed_accessors", requestor),
          metadata: Date.now()
        });
      }

      // Otherwise public access
    }

    return true;
  }

  Respond(requestId, source, responseMessage) {
    responseMessage = this.props.client.utils.MakeClonable({
      ...responseMessage,
      requestId: requestId,
      type: "ElvFrameResponse"
    });

    try {
      source.postMessage(
        responseMessage,
        "*"
      );
    } catch(error) {
      /* eslint-disable no-console */
      console.error("Error responding to message");
      console.error(responseMessage);
      console.error(error);
      /* eslint-enable no-console */
    }
  }

  // Listen for API request messages from frame
  // TODO: Validate origin
  async ApiRequestListener(event) {
    // Ignore unrelated messages
    if(!event || !event.data || event.data.type !== "ElvFrameRequest") { return; }

    const requestId = event.data.requestId;
    const source = event.source;

    switch(event.data.operation) {
      // App requested its app path
      case "GetFramePath":
        // TODO: Replace with match params
        const appLocation = window.location.hash.replace(`#${this.state.basePath}`, "") || "/";

        this.Respond(requestId, source, {response: appLocation});
        break;

      // App requested to push its new app path
      case "SetFramePath":
        history.replaceState(null, null, `#${Path.join(this.state.basePath, event.data.path)}`);

        this.Respond(requestId, source, {response: "Set path " + event.data.path});
        break;

      case "ShowAccountsPage":
        this.setState({
          redirectLocation: "/accounts"
        });
        break;

      case "ShowHeader":
        this.props.ShowHeader();
        break;

      case "HideHeader":
        this.props.HideHeader();
        break;

      // App requested an ElvClient method
      default:
        if(!(await this.CheckAccess(event))) {
          this.Respond(requestId, source, {error: new Error("Access denied")});
          return;
        }

        const responder = (response) => this.Respond(response.requestId, source, response);
        await this.props.client.CallFromFrameMessage(event.data, responder);
    }

    //this.UpdateAccountBalance();
  }

  render() {
    if(this.state.redirectLocation) {
      return <Redirect push to={this.state.redirectLocation} />;
    }

    return (
      <IFrame
        ref={this.state.appRef}
        appName={this.props.app.name}
        appUrl={this.props.app.url}
        listener={this.ApiRequestListener}
        className="app-frame"
      />
    );
  }
}

export default AppFrame;
