import React from "react";
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

const AppSelector = () => {
  return (
    <div className="main-content-container">
      <div className="actions-container centered">
        <Action type="link" to="/accounts" className="action tertiary">Accounts</Action>
      </div>
      <div className="app-list">
        <App name="Eluvio Fabric Browser" path="fabric-browser" image={FabricBrowserLogo} />
        <App name="Continuum" path="continuum" image={ContinuumLogo} />
      </div>
    </div>
  );
};

export default AppSelector;
