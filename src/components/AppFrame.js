/* AppFrame

This is a sandboxed frame that includes a message passing interface
to allow the contained app to request fabric / blockchain API requests
from the core app, which owns user account information and keys
*/

import React from "react";
import UrlJoin from "url-join";
import {Navigate, useParams} from "react-router";

import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import {Confirm} from "elv-components-js";
import {observer} from "mobx-react";
import {Debounce} from "elv-components-js";

import {rootStore, accountsStore} from "../stores";

class IFrameBase extends React.Component {
  SandboxPermissions() {
    return [
      "allow-downloads",
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
        allow="encrypted-media *; clipboard-read; clipboard-write"
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

    const appName = this.props.app;
    const basePath = UrlJoin("/apps", appName);
    const appPath = window.location.hash.replace(basePath, "").replace(encodeURI(basePath), "").substr(1) || "";
    const appUrl = UrlJoin(EluvioConfiguration.apps[appName], appPath);

    this.state = {
      appRef: React.createRef(),
      appName,
      appUrl,
      basePath,
      profileAccessAllowed: false,
      confirmPromise: undefined
    };

    // Update account balance when making requests
    this.UpdateBalance = Debounce(
      () => accountsStore.AccountBalance(accountsStore.currentAccountAddress),
      5000
    );

    this.ApiRequestListener = this.ApiRequestListener.bind(this);
  }

  // Ensure region and static token are reset if app changed it
  async componentWillUnmount() {
    await rootStore.client.ResetRegion();
    await rootStore.client.ClearStaticToken();
  }

  async CheckAccess(event) {
    if(FrameClient.PromptedMethods().includes(event.data.calledMethod)) {
      const accessLevel = await rootStore.client.userProfileClient.AccessLevel();

      // No access to private profiles
      if(accessLevel === "private") { return false; }

      // Prompt for access
      if(accessLevel === "prompt") {
        const requestor = this.state.appName;
        const accessAllowed =
          this.state.profileAccessAllowed ||
          await rootStore.client.userProfileClient.UserMetadata({
            metadataSubtree: UrlJoin("allowed_accessors", requestor)
          });

        if(!accessAllowed) {
          if(!this.state.confirmPromise) {
            this.setState({
              confirmPromise: Confirm({
                message: `Do you want to allow the application "${requestor}" to access your profile?`,
                onConfirm: async () => {
                  // Record permission
                  await rootStore.client.userProfileClient.ReplaceUserMetadata({
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
    responseMessage = rootStore.client.utils.MakeClonable({
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
      case "OpenLink":
        let { libraryId, objectId, versionHash } = event.data;

        if(!objectId && versionHash) {
          objectId = rootStore.client.utils.DecodeVersionHash(versionHash).objectId;
        }

        if(!libraryId) {
          libraryId = await rootStore.client.ContentObjectLibraryId({objectId});
        }

        const fabricBrowserKey = Object.keys(EluvioConfiguration.apps)
          .find(key => key.toLowerCase().includes("fabric browser") || key.toLowerCase().includes("fabric-browser"));

        if(!fabricBrowserKey) {
          throw Error("Unable to determine fabric browser URL");
        }

        const corePath = `#/apps/${fabricBrowserKey}`;
        const fabricBrowserPath = `#/content/${libraryId}/${objectId}`;

        const url = new URL(window.location.toString());
        url.hash = `${corePath}/${fabricBrowserPath}`;

        window.open(url.toString(), "_blank");

        break;

      // App requested its app path
      case "GetFramePath":
        // TODO: Replace with match params
        const appLocation = window.location.hash.replace(`#${this.state.basePath}`, "") || "/";

        this.Respond(requestId, source, {response: appLocation});
        break;

      // App requested to push its new app path
      case "SetFramePath":
        let appPath = event.data.path.replace(/^\/+/, "");
        if(appPath.startsWith("#")) {
          // UrlJoin eats leading slash if followed by #
          appPath = UrlJoin(this.state.basePath, "/", appPath);
        } else {
          appPath = UrlJoin(this.state.basePath, appPath);
        }

        history.replaceState(null, null, `#${appPath}`);

        this.Respond(requestId, source, {response: "Set path " + event.data.path});
        break;

      case "ShowAccountsPage":
        this.setState({
          redirectLocation: "/accounts"
        });
        break;

      case "ShowAppsPage":
        rootStore.ToggleHeader(true);
        this.setState({
          redirectLocation: "/apps"
        });
        break;

      case "ShowHeader":
        rootStore.ToggleHeader(true);
        break;

      case "HideHeader":
        rootStore.ToggleHeader(false);
        break;

      // App requested an ElvClient method
      default:
        if(!(await this.CheckAccess(event))) {
          this.Respond(requestId, source, {error: new Error("Access denied")});
          return;
        }

        const responder = (response) => this.Respond(response.requestId, source, response);

        const service = (
          event.data.args &&
          event.data.args.service
        );

        if(service) {
          if(service === "search") {
            await rootStore.searchClient.CallFromFrameMessage(event.data, responder);
          } else if(service === "default") {
            await rootStore.client.CallFromFrameMessage(event.data, responder);
          } else {
            this.Respond(requestId, source, {error: new Error(`Invalid service: ${service}`)});
          }
        } else {
          await rootStore.client.CallFromFrameMessage(event.data, responder);
        }
    }
  }

  render() {
    if(this.state.redirectLocation) {
      return <Navigate replace to={this.state.redirectLocation} />;
    }

    if(!rootStore.client) {
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


// eslint-disable-next-line no-class-assign
AppFrame = observer(AppFrame);


const AppFrameWrapper = () => {
  const {app} = useParams();

  return <AppFrame app={app} />;
};

export default AppFrameWrapper;
