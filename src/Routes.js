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
import {Routes, Route, useNavigate} from "react-router-dom";
import TenantInvites from "./components/tenancy/TenantInvites";
import {Navigate, Outlet, useLocation} from "react-router";
import {tenantStore} from "./stores";
import {Tabs} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
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
  const navigate = useNavigate();
  const narrow = useMediaQuery("(max-width: 1200px)");

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
    <div className="side-nav">
      <Tabs variant={narrow ? "outline" : "default"} orientation={narrow ? "horizontal" : "vertical"} className="side-nav__tabs" h="max-content" value={location.pathname} onTabChange={pathname => navigate(pathname)}>
        <Tabs.List grow>
          <Tabs.Tab value="/tenancy">Overview</Tabs.Tab>
          <Tabs.Tab value="/tenancy/manage">Manage</Tabs.Tab>
          <Tabs.Tab value="/tenancy/invites">Invites</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <div className="content">
        <Outlet />
      </div>
    </div>
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/tenancy" element={<GatedRoute Component={TenantOverview} />} />
        <Route path="/tenancy/invites" element={<GatedRoute Component={TenantInvites} />} />
        <Route path="/tenancy/manage" element={<GatedRoute Component={TenantUsers} />} />
      </Route>
    </Routes>
  );
});

export default AppRoutes;
