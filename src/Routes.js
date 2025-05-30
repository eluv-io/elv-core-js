import React from "react";
import AppsPage from "./components/apps/Apps";
import AppFramePage from "./components/apps/AppFrame";
import AccountsFormPage from "./components/login/KeyForm";
import TransferFormPage from "./components/transfer/TransferForm";
import TenantOverview from "./components/tenancy/TenantOverview";
import {observer} from "mobx-react";
import Accounts from "./components/account/Accounts";
import {Routes, Route, NavLink} from "react-router-dom";
import TenantInvites from "./components/tenancy/TenantInvites";
import {Navigate, Outlet} from "react-router";
import {accountsStore, rootStore, tenantStore} from "./stores";
import TenantUsers from "./components/tenancy/TenantUsers";
import Login, {LoginGate, LoginGateModal} from "./components/login/Login";
import Profile from "./components/profile/Profile";
import SplashPage from "./components/login/SplashPage";
import {ImageIcon} from "./components/Misc";

import OverviewIcon from "./static/icons/overview";
import ManageIcon from "./static/icons/settings";
import InviteIcon from "./static/icons/add-user";
import ReleaseNotes from "./components/release_notes/ReleaseNotes";

const GatedRoute = ({Component}) => {
  return (
    <LoginGate>
      <Component />
    </LoginGate>
  );
};

const TenantNav = observer(() => {
  if(!tenantStore.isTenantAdmin) {
    return <Navigate to="/accounts" />;
  }

  const name = tenantStore.publicTenantMetadata?.name ||
    accountsStore.currentAccount?.tenantName ||
    "Tenant";

  return (
    <nav className="side-nav">
      <nav className="side-nav__nav">
        <h2 className="side-nav__title">
          {
            !name.startsWith("iq__") ? name :
              "Tenant"
          }
        </h2>
        <NavLink to="/tenancy" end className="side-nav__link">
          <ImageIcon icon={OverviewIcon} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/tenancy/manage" end className="side-nav__link">
          <ImageIcon icon={ManageIcon} />
          <span>Manage</span>
        </NavLink>
        <NavLink to="/tenancy/invites" end className="side-nav__link">
          <ImageIcon icon={InviteIcon} />
          <span>Invite</span>
        </NavLink>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </nav>
  );
});

const ContentNav = observer(() => {
  if(rootStore.showLoginGate) {
    return <LoginGateModal Close={() => rootStore.SetShowLoginGate(false)} />;
  }

  if(!rootStore.pathname.startsWith("/tenancy")) {
    return (
      <div className="content">
        <Outlet />
      </div>
    );
  }

  return <TenantNav />;
});

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<ContentNav />}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/add" element={<AccountsFormPage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/release_notes" element={<ReleaseNotes />} />
        <Route path="/onboard" element={<SplashPage />} />
        <Route path="/onboard/login" element={<Login />} />
        <Route path="/transfer" element={<GatedRoute Component={TransferFormPage} />} />
        <Route path="/apps/:app" element={<GatedRoute Component={AppFramePage} />} />
        <Route path="/profile" element={<GatedRoute Component={Profile} />} />
        <Route path="/tenancy" element={<GatedRoute Component={TenantOverview} />} />
        <Route path="/tenancy/invites" element={<GatedRoute Component={TenantInvites} />} />
        <Route path="/tenancy/manage" element={<GatedRoute Component={TenantUsers} />} />
      </Route>
    </Routes>
  );
});

export default AppRoutes;
