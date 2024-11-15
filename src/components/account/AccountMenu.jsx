import AccountMenuStyles from "../../static/stylesheets/modules/account-menu.module.scss";

import {observer} from "mobx-react";
import {CreateModuleClassMatcher, JoinClassNames} from "../../Utils";
import React, {useEffect, useState} from "react";
import {ButtonWithLoader, ImageIcon} from "../Misc";
import {accountsStore} from "../../stores";
import {Link} from "react-router-dom";
import {Combobox, Popover, UnstyledButton, useCombobox} from "@mantine/core";

const S = CreateModuleClassMatcher(AccountMenuStyles);

import DefaultAccountImage from "../../static/icons/User.svg";
import AppsIcon from "../../static/icons/apps";
import SwitchAccountsIcon from "../../static/icons/switch-accounts";
import ProfileIcon from "../../static/icons/User";
import TransferFundsIcon from "../../static/icons/dollar-sign";

export const AccountSelector = observer(({center, className=""}) => {
  const combobox = useCombobox();

  const options = accountsStore.sortedAccounts
    .filter(address => address !== accountsStore.currentAccountAddress)
    .map(address => {
      const account = accountsStore.accounts[address];
      const profileImage = accountsStore.ResizeImage(account.imageUrl, 200) || DefaultAccountImage;

      return (
        <Combobox.Option value={address} key={address}>
          <div className={S("account-selector__image-container")}>
            <div className={S("account-selector__image-container")}>
              <ImageIcon
                icon={profileImage}
                alternateIcon={DefaultAccountImage}
                className={S("account-selector__image")}
              />
            </div>
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

  const profileImage = accountsStore.ResizeImage(accountsStore?.currentAccount?.imageUrl, 200) || DefaultAccountImage;

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
                <div className={S("account-selector__image-container")}>
                  <ImageIcon
                    icon={profileImage}
                    alternateIcon={DefaultAccountImage}
                    className={S("account-selector__image")}
                  />
                </div>
                <div className={S("account-selector__account")}>
                  <div className={S(`account-selector__${accountsStore.currentAccount.name ? "name" : "address"}`, "ellipsis")}>
                    {accountsStore.currentAccount.name || accountsStore.currentAccount.address}
                  </div>
                  {
                    !accountsStore.currentAccount.tenantName ? null :
                      <div className={S("account-selector__tenant", "ellipsis")}>
                        Tenant: {accountsStore.currentAccount.tenantName}
                      </div>
                  }
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
  const limited = !accountsStore.currentAccount || accountsStore.currentAccount?.lowBalance;
  return (
    <div className={S("account-menu")}>
      <h2 className={S("account-menu__header")}>Signed in</h2>
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
      </div>
      <ButtonWithLoader
        className={S("account-menu__sign-out")}
        onClick={async () => await accountsStore.LockAccount({address: accountsStore.currentAccountAddress})}
      >
        Sign Out
      </ButtonWithLoader>
    </div>
  );
});

const HeaderProfile = observer(() => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    window.__HideMenu = showMenu ? undefined : () => setShowMenu(false);
  }, [showMenu]);

  if(!accountsStore.currentAccount) {
    return (
      <Link to="/accounts" className={S("header-profile", "header-profile--no-account")}>
        Not Logged In
      </Link>
    );
  } else {
    const profileImage = accountsStore.ResizeImage(accountsStore.currentAccount.imageUrl, 200) || DefaultAccountImage;

    return (
      <Popover opened={showMenu} onChange={setShowMenu}>
        <Popover.Target className={S("header-profile")}>
          <UnstyledButton onClick={() => setShowMenu(!showMenu)} className={S("header-profile__content")}>
            <div className={S("header-profile__image-container")}>
              <div className={S("header-profile__image-container")}>
                <ImageIcon
                  icon={profileImage}
                  alternateIcon={DefaultAccountImage}
                  className={S("header-profile__image")}
                />
              </div>
            </div>
            <div className={S("header-profile__account")}>
              <div className={S(`header-profile__${accountsStore.currentAccount.name ? "name" : "address"}`, "ellipsis")}>
                {accountsStore.currentAccount.name || accountsStore.currentAccount.address}
              </div>
              {
                !accountsStore.currentAccount.tenantName ? null :
                  <div className={S("header-profile__tenant", "ellipsis")}>
                    Tenant: { accountsStore.currentAccount.tenantName }
                  </div>
              }
            </div>
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown classNames={{dropdown: S("account-menu__dropdown")}}>
          <AccountMenu Close={() => setShowMenu(false)} />
        </Popover.Dropdown>
      </Popover>
    );
  }
});

export default HeaderProfile;
