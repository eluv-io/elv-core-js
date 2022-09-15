import "../static/stylesheets/apps.scss";

import React from "react";
import GenericAppLogo from "../static/icons/App.svg";
import {Action, CroppedIcon} from "elv-components-js";
import UrlJoin from "url-join";

import FabricBrowserIcon from "../static/images/FabricBrowser.png";
import VideoEditorIcon from "../static/images/VideoEditor.png";
import SiteSampleIcon from "../static/images/SiteSample.png";
import StreamSampleIcon from "../static/images/StreamSample.png";
import StudioIcon from "../static/images/Studio.png";

const icons = {
  "Fabric Browser": FabricBrowserIcon,
  "Video Editor": VideoEditorIcon,
  "Site Sample": SiteSampleIcon,
  "Stream Sample": StreamSampleIcon,
  "Media Ingest": StudioIcon
};

class Apps extends React.PureComponent {
  App(name) {
    const logo = icons[Object.keys(icons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png");

    return (
      <Action key={`app-${name}`} label={`Go to ${name}`} type="link" to={`/apps/${name}`} button={false}>
        <div className="app-selection">
          <CroppedIcon icon={logo} alternateIcon={GenericAppLogo} className="app-logo" />
          <h4>{name}</h4>
        </div>
      </Action>
    );
  }

  render() {
    return (
      <div className="page-content">
        <div className="apps">
          { Object.keys(EluvioConfiguration.apps).map(name => this.App(name))}
        </div>
      </div>
    );
  }
}

export default Apps;
