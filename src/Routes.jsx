import React from "react";
import AppsPage from "./components/apps/Apps";
import AppFramePage from "./components/apps/AppFrame";
import AccountsFormPage from "./components/login/KeyForm";
import TransferFormPage from "./components/transfer/TransferForm";
import TenantOverview from "./components/tenancy/TenantOverview";
import {observer} from "mobx-react";
import Accounts from "./components/account/Accounts";
import TenantInvites from "./components/tenancy/TenantInvites";
import {accountsStore, rootStore, tenantStore} from "./stores";
import TenantUsers from "./components/tenancy/TenantUsers";
import Login, {LoginGate, LoginGateModal} from "./components/login/Login";
import Profile from "./components/profile/Profile";
import SplashPage from "./components/login/SplashPage";
import {ImageIcon} from "./components/Misc";
import ReleaseNotes from "./components/release_notes/ReleaseNotes";

import {Link, Redirect, Route, Switch} from "wouter";

import OverviewIcon from "./static/icons/overview.svg";
import ManageIcon from "./static/icons/settings.svg";
import InviteIcon from "./static/icons/add-user.svg";

const GatedRoute = ({Component, children}) => {
  return (
    <LoginGate>
      {
        children ?
          children :
          <Component />
      }
    </LoginGate>
  );
};

const TenantRoutes = observer(() => {
  if(!tenantStore.isTenantAdmin) {
    return <Redirect to="/accounts" />;
  }

  const name = tenantStore.publicTenantMetadata?.name ||
    accountsStore.currentAccount?.tenantName ||
    "Tenant";

  return (
    <GatedRoute>
      <nav className="side-nav">
        <nav className="side-nav__nav">
          <h2 className="side-nav__title">
            {
              !name.startsWith("iq__") ? name :
                "Tenant"
            }
          </h2>
          <Link to="/" className={active => `side-nav__link ${active ? "side-nav__link--active" : ""}`}>
            <ImageIcon icon={OverviewIcon} />
            <span>Overview</span>
          </Link>
          <Link to="/manage" className={active => `side-nav__link ${active ? "side-nav__link--active" : ""}`}>
            <ImageIcon icon={ManageIcon} />
            <span>Manage</span>
          </Link>
          <Link to="/invites" className={active => `side-nav__link ${active ? "side-nav__link--active" : ""}`}>
            <ImageIcon icon={InviteIcon} />
            <span>Invite</span>
          </Link>
        </nav>
        <div className="content">
          <Switch>
            <Route path="/" component={TenantOverview} />
            <Route path="/invites" component={TenantInvites} />
            <Route path="/manage" component={TenantUsers} />
          </Switch>
        </div>
      </nav>
    </GatedRoute>
  );
});

const ContentWrapper = observer(({children}) => {
  if(rootStore.showLoginGate) {
    return <LoginGateModal Close={() => rootStore.SetShowLoginGate(false)} />;
  }

  return (
    <div className="content">
      { children }
    </div>
  );
});

const AppRoutes = observer(() => {
  return (
    <Switch>
      <Route path="/tenancy" nest>
        <TenantRoutes />
      </Route>
      <Route path="/" nest>
        <ContentWrapper>
          <Route path="/" component={SplashPage} />
          <Route path="/login" component={Login} />
          <Route path="/accounts" component={Accounts} />
          <Route path="/accounts/add" component={AccountsFormPage} />
          <Route path="/apps" component={AppsPage} />
          <Route path="/release_notes" component={ReleaseNotes} />
          <Route path="/onboard" component={SplashPage} />
          <Route path="/onboard/login" component={Login} />
          <Route path="/transfer" component={() => <GatedRoute Component={TransferFormPage} />} />
          <Route path="/apps/:app" component={() => <GatedRoute Component={AppFramePage} />} />
          <Route path="/profile" component={() => <GatedRoute Component={Profile} />} />
        </ContentWrapper>
      </Route>
    </Switch>
  );
});

export default AppRoutes;
