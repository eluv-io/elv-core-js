import React from "react";
import AppsPage from "./components/Apps";
import AppFramePage from "./components/AppFrame";
import ProfilePage from "./components/Profile";
import AccountsFormPage from "./components/AccountForm";
import TransferFormPage from "./components/TransferForm";
import Offerings from "./components/offerings/Offerings";
import Onboard from "./components/onboarding/Onboard";
import TenantOverview from "./components/tenancy/TenantOverview";
import {observer} from "mobx-react";
import LoginGate from "./LoginGate";
import Accounts from "./components/Accounts";
import {Routes, Route} from "react-router-dom";

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
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/accounts/add" element={<AccountsFormPage />} />
      <Route path="/apps" element={<AppsPage />} />
      <Route path="/offerings" element={<Offerings />} />
      <Route path="/onboard" element={<Onboard />} />

      <Route path="/profile" element={<GatedRoute Component={ProfilePage} />} />
      <Route path="/tenancy" element={<GatedRoute Component={TenantOverview} />} />
      <Route path="/transfer" element={<GatedRoute Component={TransferFormPage} />} />
      <Route path="/apps/:app" element={<GatedRoute Component={AppFramePage} />} />
    </Routes>
  );
});

export default AppRoutes;
