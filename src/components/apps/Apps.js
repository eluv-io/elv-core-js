import "../../static/stylesheets/apps.scss";

import React from "react";
import GenericAppLogo from "../../static/icons/App.svg";
import {Link} from "react-router-dom";
import AppInfo from "./AppInfo";
import {ImageIcon} from "../Misc";
import {accountsStore} from "../../stores";
import {Navigate} from "react-router";

class Apps extends React.PureComponent {
  App({name, logo}) {

    return (
      <Link key={`app-${name}`} label={`Go to ${name}`} type="link" to={`/apps/${name}`}>
        <div className="app-selection">
          <ImageIcon icon={logo || GenericAppLogo} alternateIcon={GenericAppLogo} className="app-logo" />
          <h4>{name}</h4>
        </div>
      </Link>
    );
  }

  render() {
    if(parseFloat(accountsStore.currentAccount?.balance || 0) < 0.01) {
      return <Navigate to="/accounts" />;
    }

    const { apps, tools, suiteApps } = AppInfo;

    return (
      <div className="page-content">
        <div className="apps">
          <div className="apps-row">
            <div className="apps-box">
              <h2>Application Suite</h2>
              <div className="apps-box__apps">
                { apps.map(app => this.App(app)) }
              </div>
            </div>
            <div className="apps-box">
              <h2>Intelligence Suite</h2>
              <div className="apps-box__apps">
                { suiteApps.map(app => this.App(app)) }
              </div>
            </div>
          </div>

          <div className="apps-row">
            <div className="apps-box">
              <h2>Tools</h2>
              <div className="apps-box__apps">
                { tools.map(app => this.App(app)) }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Apps;
