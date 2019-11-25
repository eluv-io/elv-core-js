/* AppFrame

This is a sandboxed frame that includes a message passing interface
to allow the contained app to request fabric / blockchain API requests
from the core app, which owns user account information and keys
*/

import React from "react";
import UrlJoin from "url-join";
import Redirect from "react-router/es/Redirect";

import {FrameClient} from "elv-client-js/src/FrameClient";
import {Confirm} from "elv-components-js";
import {inject, observer} from "mobx-react";
import withRouter from "react-router/es/withRouter";
import {Debounce} from "elv-components-js";

class IFrameBase extends React.Component {
  SandboxPermissions() {
    return [
      "allow-scripts",
      "allow-forms",
      "allow-modals",
      "allow-pointer-lock",
      "allow-orientation-lock",
      "allow-popups",
      "allow-presentation",
      "allow-same-origin",
      "allow-downloads-without-user-activation"
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
        aria-label={`Eluvio Core Application: ${this.props.appName}`}
        ref={this.props.appRef}
        src={this.props.appUrl}
        sandbox={this.SandboxPermissions()}
        allow="encrypted-media *"
        className={this.props.className}
        allowFullScreen={true}
      />
    );
  }
}

const IFrame = React.forwardRef(
  (props, appRef) => <IFrameBase appRef={appRef} {...props} />
);

@inject("root")
@inject("accounts")
@observer
class AppFrame extends React.Component {
  constructor(props) {
    super(props);

    const appName = this.props.match.params.app;
    const appUrl = EluvioConfiguration.apps[appName];

    this.state = {
      appRef: React.createRef(),
      appName,
      appUrl,
      // TODO: pull directly out of props
      basePath: encodeURI(UrlJoin("/apps", appName)),
      profileAccessAllowed: false,
      confirmPromise: undefined
    };

    // Update account balance when making requests
    this.UpdateBalance = Debounce(
      () => this.props.accounts.AccountBalance(this.props.accounts.currentAccountAddress),
      5000
    );

    this.ApiRequestListener = this.ApiRequestListener.bind(this);
  }

  // Ensure region is reset if app changed it
  async componentWillUnmount() {
    await this.props.root.client.ResetRegion();
  }

  async CheckAccess(event) {
    if(FrameClient.PromptedMethods().includes(event.data.calledMethod)) {
      const accessLevel = await this.props.root.client.userProfileClient.AccessLevel();

      // No access to private profiles
      if(accessLevel === "private") { return false; }

      // Prompt for access
      if(accessLevel === "prompt") {
        const requestor = this.state.appName;
        const accessAllowed =
          this.state.profileAccessAllowed ||
          await this.props.root.client.userProfileClient.UserMetadata({
            metadataSubtree: UrlJoin("allowed_accessors", requestor)
          });

        if(!accessAllowed) {
          if(!this.state.confirmPromise) {
            this.setState({
              confirmPromise: Confirm({
                message: `Do you want to allow the application "${requestor}" to access your profile?`,
                onConfirm: async () => {
                  // Record permission
                  await this.props.root.client.userProfileClient.ReplaceUserMetadata({
                    metadataSubtree: UrlJoin("allowed_accessors", requestor),
                    metadata: Date.now()
                  });

                  await new Promise(resolve =>
                    this.setState({
                      profileAccessAllowed: true
                    }, resolve)
                  );
                }
              })
            });
          }

          await this.state.confirmPromise;

          this.setState({confirmPromise: undefined});

          if(!this.state.profileAccessAllowed) {
            return false;
          }
        }
      }

      // Otherwise public access
    }

    // If making a user metadata call, namespace metadata under app subtree
    if(FrameClient.MetadataMethods().includes(event.data.calledMethod)) {
      event.data.args = {
        ...event.data.args,
        metadataSubtree: UrlJoin(this.state.appName, event.data.args.metadataSubtree || "")
      };
    }

    return true;
  }

  Respond(requestId, source, responseMessage) {
    responseMessage = this.props.root.client.utils.MakeClonable({
      ...responseMessage,
      requestId: requestId,
      type: "ElvFrameResponse"
    });

    try {
      source.postMessage(
        responseMessage,
        "*"
      );
    } catch (error) {
      /* eslint-disable no-console */
      console.error("Error responding to message");
      console.error(responseMessage);
      console.error(error);
      /* eslint-enable no-console */
    }

    this.UpdateBalance();
  }

  // Listen for API request messages from frame
  // TODO: Validate origin
  async ApiRequestListener(event) {
    // Ignore unrelated messages
    if(!event || !event.data || event.data.type !== "ElvFrameRequest") { return; }

    const requestId = event.data.requestId;
    const source = event.source;

    switch (event.data.operation) {
      // App requested its app path
      case "GetFramePath":
        // TODO: Replace with match params
        const appLocation = window.location.hash.replace(`#${this.state.basePath}`, "") || "/";

        this.Respond(requestId, source, {response: appLocation});
        break;

      // App requested to push its new app path
      case "SetFramePath":
        history.replaceState(null, null, `#${UrlJoin(this.state.basePath, event.data.path)}`);

        this.Respond(requestId, source, {response: "Set path " + event.data.path});
        break;

      case "ShowAccountsPage":
        this.setState({
          redirectLocation: "/accounts"
        });
        break;

      case "ShowHeader":
        this.props.root.ToggleHeader(true);
        break;

      case "HideHeader":
        this.props.root.ToggleHeader(false);
        break;

      // App requested an ElvClient method
      default:
        if(!(await this.CheckAccess(event))) {
          this.Respond(requestId, source, {error: new Error("Access denied")});
          return;
        }

        const responder = (response) => this.Respond(response.requestId, source, response);
        await this.props.root.client.CallFromFrameMessage(event.data, responder);
    }
  }

  render() {
    if(this.state.redirectLocation) {
      return <Redirect push to={this.state.redirectLocation} />;
    }

    if(!this.props.root.client) {
      return null;
    }

    return (
      <IFrame
        ref={this.state.appRef}
        appName={this.state.appName}
        appUrl={this.state.appUrl}
        listener={this.ApiRequestListener}
        className="app-frame"
      />
    );
  }
}

export default withRouter(AppFrame);
