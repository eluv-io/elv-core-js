import React from "react";
import AppsPage from "./components/apps/Apps";
import AppFramePage from "./components/apps/AppFrame";
import ProfilePage from "./components/profile/Profile";
import AccountsFormPage from "./components/account/AccountForm";
import TransferFormPage from "./components/transfer/TransferForm";
import Offerings from "./components/offerings/Offerings";
import Onboard from "./components/onboarding/Onboard";
import TenantOverview from "./components/tenancy/TenantOverview";
import {observer} from "mobx-react";
import LoginGate from "./components/login/LoginGate";
import Accounts from "./components/account/Accounts";
import {Routes, Route} from "react-router-dom";
import TenantInvites from "./components/tenancy/TenantInvites";
import {Navigate} from "react-router";

const GatedRoute = ({Component}) => {
  return (
    <LoginGate>
      <Component />
    </LoginGate>
  );
};

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route index element={<Navigate to="/accounts" replace />} />

      <Route path="/accounts" element={<Accounts />} />
      <Route path="/accounts/add" element={<AccountsFormPage />} />
      <Route path="/apps" element={<AppsPage />} />
      <Route path="/offerings" element={<Offerings />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/transfer" element={<GatedRoute Component={TransferFormPage} />} />
      <Route path="/apps/:app" element={<GatedRoute Component={AppFramePage} />} />
      <Route path="/profile" element={<GatedRoute Component={ProfilePage} />} />
      <Route path="/tenancy" element={<GatedRoute Component={TenantOverview} />} />
      <Route path="/tenancy/invites" element={<GatedRoute Component={TenantInvites} />} />
    </Routes>
  );
});

export default AppRoutes;
