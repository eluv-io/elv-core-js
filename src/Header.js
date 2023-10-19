import "./static/stylesheets/header.scss";

import React from "react";
import {observer} from "mobx-react";
import {rootStore} from "./stores";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import {HeaderAccount} from "./components/account/AccountDropdown";
import {Link} from "react-router-dom";

const Header = observer(() => {
  let logo = Logo;
  if(["demo", "demov3"].includes(rootStore.networkName)) {
    logo = LogoDemo;
  } else if(rootStore.networkName === "test") {
    logo = LogoTest;
  }

  return (
    <header className="header">
      <Link to="/apps" className="logo">
        <img src={logo} alt="Eluvio" />
      </Link>
      <div className="toggle-header-section"/>
      <HeaderAccount />
    </header>
  );
});

export default Header;
