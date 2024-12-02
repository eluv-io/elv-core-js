import AccountMenuStyles from "../../static/stylesheets/modules/account-menu.module.scss";

import {observer} from "mobx-react";
import {CreateModuleClassMatcher, JoinClassNames} from "../../utils/Utils";
import React, {useState} from "react";
import {ButtonWithLoader, DefaultProfileImage, ImageIcon} from "../Misc";
import {rootStore, accountsStore, tenantStore} from "../../stores";
import {Link, useNavigate} from "react-router-dom";
import {Button, Combobox, Popover, UnstyledButton, useCombobox} from "@mantine/core";

const S = CreateModuleClassMatcher(AccountMenuStyles);

import AppsIcon from "../../static/icons/apps";
import SwitchAccountsIcon from "../../static/icons/switch-accounts";
import ProfileIcon from "../../static/icons/User";
import TransferFundsIcon from "../../static/icons/dollar-sign";
import TenancyIcon from "../../static/icons/settings";
import {LoginGateModal} from "../login/Login";

export const AccountSelector = observer(({center, className=""}) => {
  const combobox = useCombobox();

  const options = accountsStore.sortedAccounts
    .filter(address => address !== accountsStore.currentAccountAddress)
    .map(address => {
      const account = accountsStore.accounts[address];
      const profileImage = accountsStore.ResizeImage(account.imageUrl, 200);

      return (
        <Combobox.Option value={address} key={address}>
          <div className={S("round-image", "account-selector__image")}>
            <ImageIcon
              icon={profileImage}
              alternateIcon={DefaultProfileImage(account)}
            />
          </div>
          <div className={S("account-selector__account")}>
            <div className={S(`account-selector__${account.name ? "name" : "address"}`, "ellipsis")}>
              {account.name || account.address}
            </div>
            {
              !account.tenantName ? null :
                <div className={S("account-selector__tenant", "ellipsis")}>
                  Tenant: { account.tenantName }
                </div>
            }
          </div>
        </Combobox.Option>
      );
    });

  const profileImage = accountsStore.ResizeImage(accountsStore?.currentAccount?.imageUrl, 200);

  return (
    <Combobox
      onOptionSubmit={address => {
        accountsStore.SetCurrentAccount({address, switchAccount: true});
        combobox.closeDropdown();
      }}
      store={combobox}
      classNames={{
        dropdown: S("account-selector__dropdown"),
        options: S("account-selector__options"),
        option: S("account-selector__option")
      }}
    >
      <Combobox.Target>
        <UnstyledButton
          onClick={() => combobox.toggleDropdown()}
          className={
            JoinClassNames(
              S(
                "account-selector__option",
                "account-selector__current-account",
                center ? "account-selector__current-account--center" : ""
              ),
              className,
            )
          }
        >
          {
            !accountsStore.currentAccount ?
              <div className={S("account-selector__account")}>
                <div className={S("account-selector__name")}>
                  Select an Account
                </div>
              </div> :
              <>
                <div className={S("round-image", "account-selector__image")}>
                  <ImageIcon
                    icon={profileImage}
                    alternateIcon={DefaultProfileImage(accountsStore.currentAccount)}
                  />
                </div>
                <div className={S("account-selector__account")}>
                  <div className={S(`account-selector__${accountsStore.currentAccount.name ? "name" : "address"}`, "ellipsis")}>
                    {accountsStore.currentAccount.name || accountsStore.currentAccount.address}
                  </div>
                </div>
              </>
          }
        </UnstyledButton>
      </Combobox.Target>
      <Combobox.Dropdown w={500}>
        <Combobox.Options>
          {options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
});

const AccountMenu = observer(({Close}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const limited = !accountsStore.currentAccount || accountsStore.currentAccount?.lowBalance;

  if(showLoginModal) {
    return <LoginGateModal Close={() => setShowLoginModal(false)} />;
  }

  return (
    <div className={S("account-menu")}>
      <h2 className={S("account-menu__header")}>
        { accountsStore.isUnlocked ? "Signed in" : "Selected Account" }
      </h2>
      <AccountSelector />
      <div className={S("account-menu__separator")} />
      <div className={S("account-menu__actions")}>
        <Link aria-disabled={limited} disabled to="/apps" onClick={Close} className={S("account-menu__action", limited ? "account-menu__action--disabled" : "")}>
          <ImageIcon icon={AppsIcon} />
          <span>Apps</span>
        </Link>
        <Link to="/accounts" onClick={Close} className={S("account-menu__action")}>
          <ImageIcon icon={SwitchAccountsIcon} />
          <span>Add/Switch Accounts</span>
        </Link>
        <Link to="/profile" onClick={Close} className={S("account-menu__action")}>
          <ImageIcon icon={ProfileIcon} />
          <span>Profile</span>
        </Link>
        <Link aria-disabled={limited} to="/transfer" onClick={Close} className={S("account-menu__action", limited ? "account-menu__action--disabled" : "")}>
          <ImageIcon icon={TransferFundsIcon} />
          <span>Transfer Funds</span>
        </Link>
        {
          !tenantStore.isTenantAdmin ? null :
            <Link aria-disabled={limited} to="/tenancy" onClick={Close} className={S("account-menu__action", limited ? "account-menu__action--disabled" : "")}>
              <ImageIcon icon={TenancyIcon} />
              <span>Tenancy Management</span>
            </Link>
        }
      </div>
      {
        accountsStore.isUnlocked ?
          <ButtonWithLoader
            h={45}
            className={S("account-menu__sign-out")}
            onClick={async () => {
              Close();
              navigate("/accounts");
              await accountsStore.LockAccount({address: accountsStore.currentAccountAddress});
            }}
          >
            Sign Out
          </ButtonWithLoader> :
          <Button
            h={45}
            className={S("account-menu__sign-out")}
            onClick={() => {
              rootStore.SetShowLoginGate(true);
              Close();
            }}
          >
            Sign In
          </Button>
      }
    </div>
  );
});

const HeaderProfile = observer(() => {
  const [showMenu, setShowMenu] = useState(false);

  if(!accountsStore.currentAccount) {
    return (
      <Link to="/accounts" className={S("header-profile", "header-profile--no-account")}>
        Not Logged In
      </Link>
    );
  } else {
    const profileImage = accountsStore.ResizeImage(accountsStore.currentAccount.imageUrl, 200);

    return (
      <Popover opened={showMenu} onChange={setShowMenu} offset={15}>
        <Popover.Target>
          <UnstyledButton
            onClick={() => setShowMenu(!showMenu)}
            className={
              S(
                "header-profile__content",
                !accountsStore.isUnlocked ? "header-profile__content--locked" : "",
                showMenu ? "header-profile__content--active" : "",
                rootStore.darkMode ? "header-profile__content--dark" : "",
              )
            }
          >
            <div className={S("round-image", "header-profile__image")}>
              <ImageIcon
                icon={profileImage}
                alternateIcon={DefaultProfileImage(accountsStore.currentAccount)}
              />
            </div>
            <div className={S("header-profile__account")}>
              <div
                className={S(`header-profile__${accountsStore.currentAccount.name ? "name" : "address"}`, "ellipsis")}>
                {accountsStore.currentAccount.name || accountsStore.currentAccount.address}
              </div>
              {
                !accountsStore.currentAccount.tenantName ? null :
                  <div className={S("header-profile__tenant", "ellipsis")}>
                    Tenant: {accountsStore.currentAccount.tenantName}
                  </div>
              }
            </div>
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown classNames={{dropdown: S("account-menu__dropdown")}}>
          <AccountMenu Close={() => setShowMenu(false)}/>
        </Popover.Dropdown>
      </Popover>
    );
  }
});

export default HeaderProfile;
