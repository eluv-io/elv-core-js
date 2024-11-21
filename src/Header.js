import "./static/stylesheets/header.scss";

import React from "react";
import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";
import {Link, NavLink} from "react-router-dom";
import {ImageIcon} from "./components/Misc";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import LogoPreview from "./static/images/LogoPreview.png";
import AccountMenu from "./components/account/AccountMenu";
import AppsLogo from "./static/icons/apps";

const Header = observer(() => {
  let logo = Logo;
  if(rootStore.coreUrl?.includes("v3-dev")) {
    logo = LogoPreview;
  } else if(rootStore.networkName === "test") {
    logo = LogoTest;
  } else if(["demo", "demov3"].includes(rootStore.networkName)) {
    logo = LogoDemo;
  }

  return (
    <header className={`header ${rootStore.darkMode ? "header--dark" : ""}`}>
      <Link to="/apps" className="logo">
        <img src={logo} alt="Eluvio" />
      </Link>
      <div className="toggle-header-section"/>
      <div className="header-menu">
        {
          !accountsStore.currentAccount || accountsStore.currentAccount?.lowBalance ? null :
            <NavLink to="/apps" title="Apps" className="header-apps-link">
              <ImageIcon icon={AppsLogo} alt="Eluvio" />
            </NavLink>
        }
        <AccountMenu />
      </div>
    </header>
  );
});

export default Header;
