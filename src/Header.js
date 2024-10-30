import "./static/stylesheets/header.scss";

import React from "react";
import {observer} from "mobx-react";
import {rootStore} from "./stores";
import {Link} from "react-router-dom";
import {HeaderAccount} from "./components/account/AccountDropdown";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import LogoPreview from "./static/images/LogoPreview.png";

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
      <HeaderAccount />
    </header>
  );
});

export default Header;
