import "../static/stylesheets/apps.scss";

import React from "react";
import GenericAppLogo from "../static/icons/App.svg";
import {Action, CroppedIcon} from "elv-components-js";
import UrlJoin from "url-join";

class Apps extends React.PureComponent {
  App(name) {
    const displayName = name;
    const logoUrl = UrlJoin(this.props.apps[name], "logo.png");

    return (
      <Action key={`app-${name}`} label={`Go to ${displayName}`} type="link" to={`/apps/${name}`} button={false}>
        <div className="app-selection">
          <CroppedIcon icon={logoUrl} alternateIcon={GenericAppLogo} className="app-logo" />
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
