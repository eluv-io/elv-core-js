import "../../static/stylesheets/accounts.scss";

import React, {useState} from "react";
import {observer} from "mobx-react";
import {Balance, Confirm, CroppedIcon, IconButton, ImageIcon, LoadingElement} from "elv-components-js";
import LoginModal from "../login/LoginModal";
import {accountsStore} from "../../stores";
import {Utils} from "@eluvio/elv-client-js";
import {Button, Group} from "@mantine/core";

import LockedIcon from "../../static/icons/Locked.svg";
import UnlockedIcon from "../../static/icons/Unlocked.svg";
import DefaultAccountImage from "../../static/icons/User.svg";
import RemoveAccountIcon from "../../static/icons/X.svg";
import {Link} from "react-router-dom";

const Account = observer(({address}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const account = accountsStore.accounts[address];

  const isCurrentAccount = Utils.EqualAddress(accountsStore.currentAccountAddress, account.address);
  const accountLocked = !account.signer;

  let selectAccountButton;
  if(!isCurrentAccount || accountLocked) {
    selectAccountButton = (
      <Button
        miw={125}
        fz="xs"
        onClick={async () => {
          if(accountsStore.accounts[address].signer) {
            await accountsStore.UnlockAccount({address});
          } else {
            setShowLoginModal(true);
          }
        }}
      >
        {accountLocked ? "Unlock Account" : "Use Account"}
      </Button>
    );
  }

  let lockAccountButton;
  if(!accountLocked) {
    lockAccountButton = (
      <Button miw={125} variant="default" fz="xs" onClick={() => accountsStore.LockAccount({address})}>
        Lock Account
      </Button>
    );
  }

  const profileImage = accountsStore.ResizeImage(account.imageUrl, 200) || DefaultAccountImage;

  return (
    <>
      { !showLoginModal ? null : <LoginModal address={address} Close={() => setShowLoginModal(false)}/> }
      <div key={`account-${account.address}`} className={isCurrentAccount ? "account current-account" : "account"}>
        <ImageIcon
          icon={accountLocked ? LockedIcon : UnlockedIcon}
          label={accountLocked ? "Account Locked" : "Account Unlocked"}
          className={`account-lock-icon ${accountLocked ? "" : "account-unlocked-icon"}`}
        />
        <IconButton
          icon={RemoveAccountIcon}
          label={"Remove Account"}
          onClick={() => {
            Confirm({
              message: "Are you sure you want to remove this account?",
              onConfirm: () => accountsStore.RemoveAccount(address)
            });
          }}
          className={"account-remove-icon"}
        />
        <CroppedIcon
          icon={profileImage}
          alternateIcon={DefaultAccountImage}
          label="Profile Image"
          className="account-image"
          useLoadingIndicator={true}
        />
        <div className="account-main">
          <div className="account-info">
            <div className="account-name">{account.name || "\u00a0"}</div>
            <div className="account-address">{account.address}</div>
            <Balance balance={account.balance} className="account-balance" />
          </div>
          <div className="account-actions">
            <LoadingElement loadingClassname="account-loading" loading={accountsStore.loadingAccount === address}>
              <Group spacing="sm" noWrap>
                { selectAccountButton }
                { lockAccountButton }
              </Group>
            </LoadingElement>
          </div>
        </div>
      </div>
    </>
  );
});

const Accounts = observer(() => {
  return (
    <div className="page-content">
      <div className="accounts">
        { accountsStore.sortedAccounts.map(address => <Account address={address} key={`account-${address}`} />) }
      </div>
      <div className="actions-container flex-centered add-account">
        <Button component={Link} to="/accounts/add">
          Add Account
        </Button>
      </div>
    </div>
  );
});

export default Accounts;
