import "../static/stylesheets/header.scss";

import React from "react";
import {
  IconButton,
} from "elv-components-js";
import {observer} from "mobx-react";
import {rootStore} from "../stores";

import Logo from "../static/images/Logo.png";
import LogoDemo from "../static/images/LogoDemo.png";
import LogoTest from "../static/images/LogoTest.png";
import LogoPreview from "../static/images/LogoPreview.png";
import ShowHeaderIcon from "../static/icons/ShowHeader.svg";
import {HeaderAccount} from "./AccountDropdown";
import {Link} from "react-router-dom";

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
    <header className={rootStore.showHeader ? "header" : "header hidden-header"}>
      <Link to="/apps" className="logo">
        <img src={logo} alt="Eluvio" />
      </Link>
      <IconButton className="toggle-header-button" icon={ShowHeaderIcon} label="Show Header" onClick={() => rootStore.ToggleHeader(true)} />
      <div
        className="toggle-header-section"
        title="Hide Header"
        aria-label="Hide Header"
        tabIndex={0}
        onClick={() => rootStore.ToggleHeader(false)}
        onKeyPress={() => rootStore.ToggleHeader(false)}
      />
      <HeaderAccount />
    </header>
  );
});

export default Header;
