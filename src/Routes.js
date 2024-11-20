import React from "react";
import AppsPage from "./components/apps/Apps";
import AppFramePage from "./components/apps/AppFrame";
import AccountsFormPage from "./components/account/KeyForm";
import TransferFormPage from "./components/transfer/TransferForm";
import Offerings from "./components/offerings/Offerings";
import Onboard from "./components/onboarding/Onboard";
import TenantOverview from "./components/tenancy/TenantOverview";
import {observer} from "mobx-react";
import Accounts from "./components/account/Accounts";
import {Routes, Route, NavLink} from "react-router-dom";
import TenantInvites from "./components/tenancy/TenantInvites";
import {Navigate, Outlet, useLocation} from "react-router";
import {accountsStore, tenantStore} from "./stores";
import TenantUsers from "./components/tenancy/TenantUsers";
import Login, {LoginGate} from "./components/login/Login";
import Profile from "./components/profile/Profile";

const GatedRoute = ({Component}) => {
  return (
    <LoginGate>
      <Component />
    </LoginGate>
  );
};

const ContentNav = observer(() => {
  const location = useLocation();

  if(
    !location.pathname.startsWith("/tenancy") ||
    !tenantStore.isTenantAdmin
  ) {
    return (
      <div className="content">
        <Outlet />
      </div>
    );
  }

  return (
    <nav className="side-nav">
      <nav className="side-nav__nav">
        <h2 className="side-nav__title">
          {
            tenantStore.publicTenantMetadata?.name ||
            accountsStore.currentAccount?.tenantName ||
            "Tenant"
          }
        </h2>
        <NavLink to="/tenancy" end className="side-nav__link">Overview</NavLink>
        <NavLink to="/tenancy/manage" end className="side-nav__link">Manage</NavLink>
        <NavLink to="/tenancy/invites" end className="side-nav__link">Invites</NavLink>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </nav>
  );
});

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<ContentNav />}>
        <Route index element={<Navigate to="/accounts" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/add" element={<AccountsFormPage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/offerings" element={<Offerings />} />
        <Route path="/onboard" element={<Onboard />} />
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
