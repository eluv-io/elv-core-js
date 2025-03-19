import HeaderStyles from "./static/stylesheets/modules/header.module.scss";

import React, {useState} from "react";
import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";
import {Link, useNavigate} from "react-router-dom";
import {CreateModuleClassMatcher} from "./utils/Utils";
import {Group, Popover, UnstyledButton} from "@mantine/core";
import {ImageIcon} from "./components/Misc";
import AppInfo, {appIcons} from "./components/apps/AppInfo";
import UrlJoin from "url-join";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import LogoPreview from "./static/images/LogoPreview.png";
import AccountMenu from "./components/account/AccountMenu";
import AppsIcon from "./static/icons/apps.svg";
import ExternalLinkIcon from "./static/icons/external-link";
import VideoEditorIcon from "./static/images/app_icons/EVIE - dark mode.png";

const S = CreateModuleClassMatcher(HeaderStyles);

const AppsMenuButton = observer(({name, logo, setShowMenu}) => {
  const navigate = useNavigate();
  return (
    <button
      className={S("apps-menu__link")}
      key={name}
      onClick={() => {
        setShowMenu(false);
        navigate(`/apps/${name}`);
      }}
    >
      <Group align="center" gap={10}>
        <ImageIcon icon={logo} className={S("apps-menu__logo")}/>
        <span>{name}</span>
      </Group>
      <a
        onClick={event => {
          event.stopPropagation();
          setShowMenu(false);
        }}
        target="_blank"
        href={UrlJoin(window.location.origin, "apps", name)}
        className={S("apps-menu__link-external")}
      >
        <ImageIcon icon={ExternalLinkIcon} className={S("icon")}/>
      </a>
    </button>
  );
});

const AppsMenu = observer(() => {
  const [showMenu, setShowMenu] = useState(false);
  if(!accountsStore.currentAccount) {
    return null;
  }

  return (
    <Popover opened={showMenu} onChange={setShowMenu} offset={20} position="bottom-start">
      <Popover.Target>
        <UnstyledButton
          aria-label="All Applications"
          onClick={() => setShowMenu(!showMenu)}
          className={S("apps-menu__button", showMenu ? "apps-menu__button--active" : "")}
        >
          <ImageIcon icon={AppsIcon}/>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown classNames={{dropdown: S("apps-menu__dropdown")}}>
        <div className={S("apps-menu__title")}>
          Content Fabric Application Suite
        </div>
        {
          AppInfo.apps.map(({name, logo}) =>
            <AppsMenuButton key={name} name={name} logo={logo} setShowMenu={setShowMenu} />
          )
        }
        <div className={S("apps-menu__separator")} />
        <div className={S("apps-menu__title")}>
          Content Fabric Tools
        </div>
        {
          AppInfo.tools.map(({name, logo}) =>
            <AppsMenuButton key={name} name={name} logo={logo} setShowMenu={setShowMenu} />
          )
        }
      </Popover.Dropdown>
    </Popover>
  );
});

const AppDisplay = observer(() => {
  let icon;

  if(rootStore.activeApp) {
    if(rootStore.activeApp === "Video Editor") {
      icon = VideoEditorIcon;
    } else {
      icon = appIcons[Object.keys(appIcons).find(key => rootStore.activeApp.includes(key))] || UrlJoin(EluvioConfiguration.apps[rootStore.activeApp], "Logo.png");
    }
  }

  return (
    <div className={S("header__app-display")}>
      {
        icon ?
          <img src={icon} className={S("header__app-logo")} alt="Logo" /> : null
      }
      { rootStore.activeApp ? rootStore.activeApp.replace("Eluvio", "") : "The Content Fabric" }
    </div>
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
      <div className={S("header__logo-container")}>
        <Link to="/apps" className={S("header__logo")}>
          <img src={logo} alt="Eluvio" />
        </Link>
        <AppsMenu />
      </div>
      <AppDisplay />
      <div className={S("header__account-container")}>
        {
          !accountsStore.currentAccount ? null :
            <Link className={S("header__apps-link")} to="/apps">
              All Applications
            </Link>
        }
        <AccountMenu />
      </div>
    </header>
  );
});

export default Header;
