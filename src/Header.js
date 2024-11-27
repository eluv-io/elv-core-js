import HeaderStyles from "./static/stylesheets/modules/header.module.scss";

import React, {useState} from "react";
import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";
import {Link} from "react-router-dom";
import {CreateModuleClassMatcher} from "./utils/Utils";
import {Popover, UnstyledButton} from "@mantine/core";
import {ImageIcon} from "./components/Misc";
import AppInfo from "./components/apps/AppInfo";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import LogoPreview from "./static/images/LogoPreview.png";
import AccountMenu from "./components/account/AccountMenu";


import AppsIcon from "./static/icons/apps.svg";

const S = CreateModuleClassMatcher(HeaderStyles);

const AppsMenu = observer(() => {
  const [showMenu, setShowMenu] = useState(false);
  if(!accountsStore.currentAccount) {
    return null;
  }

  return (
    <Popover opened={showMenu} onChange={setShowMenu} offset={20} position="bottom-start">
      <Popover.Target>
        <UnstyledButton
          onClick={() => setShowMenu(!showMenu)}
          className={S("apps-menu__button", showMenu ? "apps-menu__button--active" : "")}
        >
          <ImageIcon icon={AppsIcon} />
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown classNames={{dropdown: S("apps-menu__dropdown")}}>
        <div className={S("apps-menu__title")}>
          Content Fabric Application Suite
        </div>
        {
          AppInfo.apps.map(({name, logo}) =>
            <Link
              to={`/apps/${name}`}
              className={S("apps-menu__link")}
              key={name}
              onClick={() => setShowMenu(false)}
            >
              <ImageIcon icon={logo} className={S("apps-menu__logo")} />
              <span>{name}</span>
            </Link>
          )
        }
        <div className={S("apps-menu__separator")} />
        <div className={S("apps-menu__title")}>
          Content Fabric Tools
        </div>
        {
          AppInfo.tools.map(({name, logo}) =>
            <Link
              to={`/apps/${name}`}
              className={S("apps-menu__link")}
              key={name}
              onClick={() => setShowMenu(false)}
            >
              <ImageIcon icon={logo} className={S("apps-menu__logo")} />
              <span>{name}</span>
            </Link>
          )
        }
      </Popover.Dropdown>
    </Popover>
  );
});

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
      <AppsMenu />
      <div className={S("header__gap")} />
      {
        !accountsStore.currentAccount ? null :
          <Link className={S("header__apps-link")} to="/apps">All Applications</Link>
      }
      <AccountMenu />
    </header>
  );
});

export default Header;
