import "./static/stylesheets/navigation.scss";
import "./static/stylesheets/tenancy.scss";

import React from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {observer} from "mobx-react";
import {useLocation} from "react-router";
import {accountsStore} from "./stores";
import {Tabs} from "@mantine/core";

const ResourcesNav = () => {
  const location = useLocation();

  return (
    <div className="site-nav-container">
      <nav>
        <NavLink
          className={
            !["/offerings", "/terms", "/privacy"].includes(location.pathname) ? "active" : ""
          }
          to="/accounts"
        >
          Account
        </NavLink>
        <NavLink className={({isActive}) => isActive ? "active" : ""} to="/offerings">Offerings</NavLink>
        <a href="https://eluv.io/terms" target="_blank" rel="noreferrer">Terms</a>
        <a href="https://eluv.io/privacy" target="_blank" rel="noreferrer">Privacy</a>
      </nav>
    </div>
  );
};

const CoreNav = observer(() => {
  const account = accountsStore.currentAccount;
  const location = useLocation();
  const navigate = useNavigate();

  const locked = !account || account?.balance < 0.1;

  return (
    <div className="nav-container">
      <Tabs value={`/${location.pathname.split("/")[1]}`} onTabChange={pathname => navigate(pathname)} className="nav-container__tabs">
        <Tabs.List grow>
          <Tabs.Tab value="/apps" disabled={locked}>Apps & Tools</Tabs.Tab>
          { accountsStore.currentAccount?.tenantContractId ? <Tabs.Tab value="/tenancy" disabled={locked}>Tenancy</Tabs.Tab> : null }
          <Tabs.Tab value="/profile" disabled={locked}>Profile</Tabs.Tab>
          <Tabs.Tab value="/accounts">Accounts</Tabs.Tab>
          <Tabs.Tab value="/transfer" disabled={locked}>Transfer</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      { account?.balance < 0.05 ? <div className="warning">This account has an insufficient balance. Please fund the account.</div> : null }
    </div>
  );
});

const Navigation = observer(() => {
  const location = useLocation();
  if(location.pathname.match(/^\/apps\/.+$/) || location.pathname.startsWith("/onboard")) {
    // App frame is visible - hide navigation
    // or onboard form
    return null;
  }

  return (
    <>
      <ResourcesNav />
      <CoreNav />
    </>
  );
});

export default Navigation;
