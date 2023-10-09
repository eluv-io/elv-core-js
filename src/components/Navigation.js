import "../static/stylesheets/navigation.scss";

import React from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {observer} from "mobx-react";
import {useLocation} from "react-router";
import {accountsStore} from "../stores";
import {Tabs} from "@mantine/core";

const SiteNav = () => {
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
        <NavLink activeClassName="active" to="/offerings">Offerings</NavLink>
        <NavLink activeClassName="active" to="/terms">Terms</NavLink>
        <NavLink activeClassName="active" to="/privacy">Privacy</NavLink>
      </nav>
    </div>
  );
};

const AppNav = observer(() => {
  const account = accountsStore.currentAccount;
  const location = useLocation();
  const navigate = useNavigate();

  if(!account) {
    return (
      <div className="nav-container locked">
        <nav>
          <NavLink activeClassName="active" to="/accounts">Accounts</NavLink>
          <NavLink activeClassName="active" to="/offerings">Offerings</NavLink>
          <a target="_blank" href={"https://live.eluv.io/terms"}>Terms</a>
          <a target="_blank" href={"https://live.eluv.io/privacy"}>Privacy</a>
        </nav>
      </div>
    );
  } else if(account.balance < 0.1) {
    return (
      <div className="nav-container locked">
        <div className="warning">This account has an insufficient balance. Please fund the account.</div>
        <nav>
          <NavLink activeClassName="active" to="/accounts">Accounts</NavLink>
        </nav>
      </div>
    );
  } else {
    return (
      <div className="nav-container">
        <Tabs w="100%" maw={800} value={location.pathname} onTabChange={pathname => navigate(pathname)}>
          <Tabs.List grow>
            <Tabs.Tab value="/apps">Apps & Tools</Tabs.Tab>
            { accountsStore.currentAccount.tenantContractId ? <Tabs.Tab value="/tenancy">Tenancy</Tabs.Tab> : null }
            <Tabs.Tab value="/profile">Profile</Tabs.Tab>
            <Tabs.Tab value="/accounts">Accounts</Tabs.Tab>
            <Tabs.Tab value="/transfer">Transfer</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
    );
  }
});

const Navigation = observer(() => {
  const location = useLocation();
  if(location.pathname.match(/^\/apps\/.+$/)) {
    // App frame is visible - hide navigation
    return null;
  }

  return (
    <>
      <SiteNav />
      <AppNav />
    </>
  );
});

export default Navigation;
