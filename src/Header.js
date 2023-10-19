import "./static/stylesheets/header.scss";

import React from "react";
import {
  IconButton,
} from "elv-components-js";
import {observer} from "mobx-react";
import {rootStore} from "./stores";
import {HeaderAccount} from "./components/account/AccountDropdown";
import {Link} from "react-router-dom";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import ShowHeaderIcon from "./static/icons/ShowHeader.svg";

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
