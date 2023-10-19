import "./static/stylesheets/header.scss";

import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import LogoPreview from "./static/images/LogoPreview.png";
import {HeaderAccount} from "./components/account/AccountDropdown";

const Header = observer(() => {
  let logo = Logo;
  if(this.props.rootStore.coreUrl?.includes("preview")) {
    logo = LogoPreview;
  } else if(this.props.rootStore.networkName === "test") {
    logo = LogoTest;
  } else if(["demo", "demov3"].includes(this.props.rootStore.networkName)) {
    logo = LogoDemo;
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
