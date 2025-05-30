/* AppFrame

This is a sandboxed frame that includes a message passing interface
to allow the contained app to request fabric / blockchain API requests
from the core app, which owns user account information and keys
*/

import React, {useEffect} from "react";
import UrlJoin from "url-join";
import {Navigate, useParams} from "react-router";

import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import {observer} from "mobx-react";

import {rootStore, accountsStore} from "../../stores";

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
    const appUrl = new URL(this.props.appUrl);
    const hash = appUrl.hash;
    const params = new URLSearchParams(`?${hash.split("?")[1] || ""}`);
    appUrl.hash = appUrl.hash.split("?")[0];
    Array.from(params.keys()).forEach(key =>
      appUrl.searchParams.set(key, params.get(key))
    );

    return (
      <iframe
        aria-label={`Eluvio Core Application: ${this.props.appName}`}
        ref={this.props.appRef}
        allow="encrypted-media *; clipboard-read; clipboard-write"
        src={appUrl.toString()}
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
    const appPath = window.location.hash;
    const appUrl = UrlJoin(EluvioConfiguration.apps[appName], appPath);

    this.state = {
      appRef: React.createRef(),
      appName,
      appUrl,
      profileAccessAllowed: false,
      confirmPromise: undefined,
      balanceLastUpdated: undefined
    };

    // Update account balance when making requests
    this.UpdateBalance = async () => {
      if(Date.now() - this.state.balanceLastUpdated < 10000) {
        return;
      }

      this.setState({balanceLastUpdated: Date.now()});

      accountsStore.AccountBalance(accountsStore.currentAccountAddress);
    };

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
            /*
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
             */
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
      rootStore.Log("Error responding to message", true);
      rootStore.Log(responseMessage, true);
      rootStore.Log(error, true);
    }

    this.UpdateBalance();
  }

  // Listen for API request messages from frame
  // TODO: Validate origin
  async ApiRequestListener(event) {
    // Ignore unrelated messages
    if(!event || !event.data || event.data.type !== "ElvFrameRequest") { return; }

    if(rootStore.logFrameCalls) {
      try {
        rootStore.Log(JSON.stringify(event.data || {}, null, 2));
      } catch (error) {
        rootStore.Log("Error logging frame call:", true);
        rootStore.Log(error);
      }
    }

    const requestId = event.data.requestId;
    const source = event.source;

    switch (event.data.operation) {
      case "OpenExternalLink":
        window.open(event.data.url, "_blank", "noreferrer");

        break;
      case "OpenLink":
        let { libraryId, objectId, versionHash, app, params, path } = event.data;
        let linkAppPath;

        if(!app) {
          // Default to fabric browser
          app = "fabric browser";
        }

        const appKey = Object.keys(EluvioConfiguration.apps)
          .find(key => key.toLowerCase().includes(app));

        if(!appKey) {
          throw Error("Unable to determine app URL");
        }

        const corePath = `/apps/${appKey}`;

        linkAppPath = path;
        if(!linkAppPath) {
          if(!objectId && versionHash) {
            objectId = rootStore.client.utils.DecodeVersionHash(versionHash).objectId;
          }

          if(!libraryId) {
            libraryId = await rootStore.client.ContentObjectLibraryId({objectId});
          }

          linkAppPath = UrlJoin("#", "content", libraryId, objectId);
        }

        if(params) {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key =>
            searchParams.set(key, params[key])
          );

          linkAppPath = `${linkAppPath}?${searchParams.toString()}`;
        }

        const url = new URL(window.location.toString());
        url.pathname = corePath;
        url.hash = linkAppPath;

        window.open(url.toString(), "_blank");

        break;

      // App requested its app path
      case "GetFramePath":
        this.Respond(requestId, source, {response: window.location.hash});
        break;

      // App requested to push its new app path
      case "SetFramePath":
        let appPath = event.data.path.replace(/^\/+/, "");
        if(appPath.startsWith("#")) {
          // UrlJoin eats leading slash if followed by #
          appPath = UrlJoin("/", appPath.replace("#", ""));
        } else {
          appPath = UrlJoin(appPath);
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
        this.setState({
          redirectLocation: "/apps"
        });
        break;

      // App requested an ElvClient method
      default:
        if(!(await this.CheckAccess(event))) {
          this.Respond(requestId, source, {error: new Error("Access denied")});
          return;
        }

        const responder = (response) => this.Respond(response.requestId, source, response);

        if(event?.data?.args?.service === "search") {
          await rootStore.searchClient.CallFromFrameMessage(event.data, responder);
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


const AppFrameWrapper = observer(() => {
  const {app} = useParams();

  useEffect(() => {
    rootStore.SetActiveApp(app);

    return () => rootStore.SetActiveApp(undefined);
  }, [app]);

  return <AppFrame app={app} key={`${app}-${rootStore.accountsStore.currentAccountAddress}`} />;
});

export default AppFrameWrapper;
