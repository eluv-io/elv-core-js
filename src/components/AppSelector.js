import React from "react";
import Configuration from "../../configuration";
import GenericAppLogo from "../static/images/portrait2.png";
import ContinuumLogo from "../static/images/Continuum.svg";
import FabricBrowserLogo from "../static/images/FabricBrowser.png";
import {CroppedIcon} from "./components/Icons";
import Path from "path";
import Action from "./components/Action";

const App = ({name, path, image}) => {
  return (
    <Action type="link" to={Path.join("apps", path)} title={name}>
      <div className="app-selection">
        <CroppedIcon containerClassname="icon-container" className="dark" icon={image}/>
        <div className="app-name">
          {name}
        </div>
      </div>
    </Action>
  );
};

const Apps = () => {
  return (
    Object.keys(Configuration.apps).map(appName => {
      let image = GenericAppLogo;
      let name = appName;

      if(appName === "fabric-browser") { image = FabricBrowserLogo; name = "Eluvio Fabric Browser"; }
      if(appName === "continuum") { image = ContinuumLogo; name = "Continuum"; }

      return App({name, path: appName, image});
    })
  );
};

const AppSelector = () => {
  return (
    <div className="main-content-container">
      <div className="actions-container centered">
        <Action type="link" to="/accounts" className="action tertiary">Accounts</Action>
      </div>
      <div className="app-list">
        { Apps() }
      </div>
    </div>
  );
};

export default AppSelector;
