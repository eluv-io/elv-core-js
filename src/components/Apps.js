import "../static/stylesheets/apps.scss";

import React from "react";
import GenericAppLogo from "../static/icons/App.svg";
import {Action, ImageIcon} from "elv-components-js";
import UrlJoin from "url-join";

import FabricBrowserIcon from "../static/images/FabricBrowser.png";
import VideoEditorIcon from "../static/images/VideoEditor.png";
import SiteSampleIcon from "../static/images/site-sample.svg";
import StreamSampleIcon from "../static/images/stream-sample.svg";
import StudioIcon from "../static/images/Studio.png";
import ClipSearchIcon from "../static/images/clip-search.svg";

const icons = {
  "Fabric Browser": FabricBrowserIcon,
  "Video Editor": VideoEditorIcon,
  "Site Sample": SiteSampleIcon,
  "Stream Sample": StreamSampleIcon,
  "Media Ingest": StudioIcon,
  "Clip Search": ClipSearchIcon
};

const appNames = ["Fabric Browser", "Media Ingest", "Video Editor"];

class Apps extends React.PureComponent {
  App(name) {
    const logo = icons[Object.keys(icons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png");

    return (
      <Action key={`app-${name}`} label={`Go to ${name}`} type="link" to={`/apps/${name}`} button={false}>
        <div className="app-selection">
          <ImageIcon icon={logo || GenericAppLogo} alternateIcon={GenericAppLogo} className="app-logo" />
          <h4>{name}</h4>
        </div>
      </Action>
    );
  }

  render() {
    const apps = Object.keys(EluvioConfiguration.apps).filter(name => appNames.find(appName => name.toLowerCase().includes(appName.toLowerCase())));
    const tools = Object.keys(EluvioConfiguration.apps).filter(name => !appNames.find(appName => name.toLowerCase().includes(appName.toLowerCase())));

    return (
      <div className="page-content">
        <div className="apps">
          <div className="apps-box">
            <h2>Apps</h2>
            <div className="apps-box__apps">
              { apps.map(name => this.App(name)) }
            </div>
          </div>

          <div className="apps-box">
            <h2>Tools</h2>
            <div className="apps-box__apps">
              { tools.map(name => this.App(name)) }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Apps;
