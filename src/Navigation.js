import "./static/stylesheets/navigation.scss";
import "./static/stylesheets/tenancy.scss";

import React from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {observer} from "mobx-react";
import {useLocation} from "react-router";
import {accountsStore} from "./stores";
import {Tabs} from "@mantine/core";


const CoreNav = observer(() => {
  const account = accountsStore.currentAccount;
  const location = useLocation();
  const navigate = useNavigate();

  const locked = false && !account || account?.balance < 0.1;

  return (
    <nav>
      <NavLink to="/apps">Apps</NavLink>
      <NavLink to="/tenancy">Tenancy</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/accounts">Accounts</NavLink>
      <NavLink to="/transfer">Transfer</NavLink>
    </nav>
  );

  return (
    <div className="nav-container">
      <Tabs
        value={`/${location.pathname.split("/")[1]}`}
        onClick={pathname => {
          console.log("NAV", pathname);
          navigate(pathname);
        }}
        className="nav-container__tabs"
      >
        <Tabs.List grow>
          <Tabs.Tab value="/apps" disabled={locked}>Apps & Tools</Tabs.Tab>
          {
            // TODO: Remove
            false || !accountsStore.currentAccount?.tenantContractId ? null :
              <Tabs.Tab value="/tenancy" disabled={locked}>Tenancy</Tabs.Tab>
          }
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

  return <CoreNav />;
});

export default Navigation;
