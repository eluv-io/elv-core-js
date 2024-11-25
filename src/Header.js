import HeaderStyles from "./static/stylesheets/modules/header.module.scss";

import React from "react";
import {observer} from "mobx-react";
import {rootStore} from "./stores";
import {Link} from "react-router-dom";
import {CreateModuleClassMatcher} from "./Utils";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import LogoPreview from "./static/images/LogoPreview.png";
import AccountMenu from "./components/account/AccountMenu";

const S = CreateModuleClassMatcher(HeaderStyles);

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
    <header className={S("header", rootStore.darkMode ? "header--dark" : "")}>
      <Link to="/apps" className={S("header__logo")}>
        <img src={logo} alt="Eluvio" />
      </Link>
      <div className={S("header__gap")} />
      <AccountMenu />
    </header>
  );
});

export default Header;
