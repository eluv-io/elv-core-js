import "@/assets/stylesheets/apps.scss";

import React from "react";
import {Link, Redirect} from "wouter";
import AppInfo, {FilterAllowedApps} from "@/components/apps/AppInfo";
import {ImageIcon} from "@/components/Misc";
import {accountsStore, tenantStore} from "@/stores";
import {observer} from "mobx-react";

import GenericAppLogo from "@/assets/icons/App.svg";

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
      return <Redirect to="/accounts" />;
    }

    const tenantContractId = tenantStore.tenantContractId;
    const apps = FilterAllowedApps(AppInfo.apps, tenantContractId);
    const tools = FilterAllowedApps(AppInfo.tools, tenantContractId);
    const experiments = FilterAllowedApps(AppInfo.experiments, tenantContractId);

    return (
      <div className="page-content">
        <div className="apps">
          <div className="apps-box">
            <h2>Content Fabric Application Suite</h2>
            <div className="apps-box__apps">
              { apps.map(app => this.App(app)) }
            </div>
          </div>

          <div className="apps-box">
            <h2>Content Fabric Tools</h2>
            <div className="apps-box__apps">
              { tools.map(app => this.App(app)) }
            </div>
          </div>

          { experiments.length > 0 && (
          <>
            <div className="apps-box">
              <h2>Content Fabric Experiments</h2>
              <div className="apps-box__apps">
                { experiments.map(app => this.App(app)) }
              </div>
            </div>
          </>
          )}
        </div>
      </div>
    );
  }
}

export default observer(Apps);
