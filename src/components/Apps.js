import "../static/stylesheets/apps.scss";

import React from "react";

import GenericAppLogo from "../static/icons/App.svg";
import FabricBrowserLogo from "../static/images/FabricBrowser.png";
import ContinuumLogo from "../static/images/Continuum.svg";
import {CroppedIcon} from "elv-components-js/src/components/Icons";
import Action from "elv-components-js/src/components/Action";

class Apps extends React.PureComponent {
  App(name) {
    let displayName = name;
    let image = GenericAppLogo;
    if(name.toLowerCase() === "continuum") {
      image = ContinuumLogo;
      displayName = "Continuum";
    } else if(name.toLowerCase() === "fabric-browser") {
      image = FabricBrowserLogo;
      displayName = "Eluvio Fabric Browser";
    }

    return (
      <Action key={`app-${name}`} type="link" to={`/apps/${name}`} button={false}>
        <div className="app-selection">
          <CroppedIcon icon={image} className="app-logo" />
          <h4>{displayName}</h4>
        </div>
      </Action>
    );
  }

  render() {
    return (
      <div className="page-content">
        <div className="apps">
          { Object.keys(this.props.apps).map(name => this.App(name))}
        </div>
      </div>
    );
  }
}

export default Apps;
