import HeaderStyles from "./static/stylesheets/modules/header.module.scss";

import React, {useState} from "react";
import {observer} from "mobx-react";
import {accountsStore, rootStore, tenantStore} from "./stores";
import {Link, useNavigate} from "react-router-dom";
import {CreateModuleClassMatcher} from "./utils/Utils";
import {Group, Popover, UnstyledButton} from "@mantine/core";
import {ImageIcon} from "./components/Misc";
import AppInfo, {FilterAllowedApps} from "./components/apps/AppInfo";
import UrlJoin from "url-join";

import Logo from "./static/images/Logo.png";
import LogoDemo from "./static/images/LogoDemo.png";
import LogoTest from "./static/images/LogoTest.png";
import AccountMenu from "./components/account/AccountMenu";
import AppsIcon from "./static/icons/apps.svg";
import ExternalLinkIcon from "./static/icons/external-link";
import EvieLogo from "./static/images/app_icons/EVIE - dark mode.png";
import NotificationIcon from "./static/icons/info.svg";

const S = CreateModuleClassMatcher(HeaderStyles);

const TenantInviteNotification = observer(() => {
  if(!tenantStore.isTenantAdmin) {
    return null;
  }

  const invites = Object.keys(tenantStore.invites || {})
    .filter(key => tenantStore.invites[key].type === tenantStore.INVITE_EVENTS.ACCEPTED);

  if(invites.length === 0) {
    return;
  }

  return (
    <Link to="/tenancy/invites" className={S("notification")}>
      <ImageIcon
        icon={NotificationIcon}
        className={S("notification__icon")}
      />
      <div className={S("notification__text")}>
        {invites.length} new user{invites.length === 1 ? "" : "s"} are awaiting permissions
      </div>
      <div className={S("notification__action")}>
        Manage
      </div>
    </Link>
  );
});

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

  const tenantContractId = tenantStore.tenantContractId;
  const apps = FilterAllowedApps(AppInfo.apps, tenantContractId);
  const tools = FilterAllowedApps(AppInfo.tools, tenantContractId);
  const experiments = FilterAllowedApps(AppInfo.experiments, tenantContractId);

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
          apps.map(({name, logo}) =>
            <AppsMenuButton key={name} name={name} logo={logo} setShowMenu={setShowMenu} />
          )
        }
        <div className={S("apps-menu__separator")} />
        <div className={S("apps-menu__title")}>
          Content Fabric Tools
        </div>
        {
          tools.map(({name, logo}) =>
            <AppsMenuButton key={name} name={name} logo={logo} setShowMenu={setShowMenu} />
          )
        }
        { experiments.length > 0 && (
          <>
            <div className={S("apps-menu__separator")} />
            <div className={S("apps-menu__title")}>
              Content Fabric Experiments
            </div>
            {
              experiments.map(({name, logo}) =>
                <AppsMenuButton key={name} name={name} logo={logo} setShowMenu={setShowMenu} />
              )
            }
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
});

const CenterContent = observer(() => {
  if(rootStore.activeApp !== "Video Intelligence Editor") {
    return <TenantInviteNotification />;
  }

  return (
    <div className={S("header__app-display")}>
      <img src={EvieLogo} className={S("header__app-logo")} alt="Logo" /> : ""
      { rootStore.activeApp || "" }
    </div>
  );
});

const Header = observer(() => {
  let logo = Logo;
  if(rootStore.coreUrl?.includes("v3-dev")) {
    //logo = LogoPreview; // MM didn't like, remove
  } else if(rootStore.networkName === "test") {
    logo = LogoTest;
  } else if(["demo", "demov3"].includes(rootStore.networkName)) {
    logo = LogoDemo;
  }

  return (
    <header className={S("header", rootStore.darkMode ? "header--dark" : "")}>
      <div className={S("header__logo-container")}>
        <Link to="/apps" className={S("header__logo")}>
          <img src={logo} alt="Eluvio"/>
        </Link>
      </div>
      <CenterContent />
      <AppsMenu/>
      <div className={S("header__gap")}/>
      {
        !accountsStore.currentAccount ? null :
          <Link className={S("header__apps-link")} to="/apps">
            All Applications
          </Link>
      }
      <AccountMenu/>
    </header>
  );
});

export default Header;
