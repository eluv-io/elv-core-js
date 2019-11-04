import "../static/stylesheets/accounts.scss";

import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Balance, Confirm, CroppedIcon, IconButton, ImageIcon} from "elv-components-js";
import LoginModal from "./LoginModal";

import LockedIcon from "../static/icons/Locked.svg";
import UnlockedIcon from "../static/icons/Unlocked.svg";
import DefaultAccountImage from "../static/icons/User.svg";
import RemoveAccountIcon from "../static/icons/X.svg";

@inject("accounts")
@inject("profiles")
@observer
class Accounts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLoginModal: false,
      selectedAddress: ""
    };

    this.UnlockAccount = this.UnlockAccount.bind(this);
    this.LockAccount = this.LockAccount.bind(this);
  }

  async SelectAccount(address) {
    if(this.props.accounts.accounts[address].signer) {
      await this.props.accounts.UnlockAccount({address});
      return;
    }

    this.setState({
      showLoginModal: true,
      selectedAddress: address
    });
  }

  async UnlockAccount(password) {
    await this.props.accounts.UnlockAccount({address: this.state.selectedAddress, password});
  }

  LockAccount(address) {
    this.props.accounts.LockAccount({address});
  }

  RemoveAccount(address) {
    Confirm({
      message: "Are you sure you want to remove this account?",
      onConfirm: () => this.props.accounts.RemoveAccount(address)
    });
  }

  LoginModal() {
    if(!this.state.showLoginModal) { return; }

    return (
      <LoginModal
        address={this.state.selectedAddress}
        Submit={this.UnlockAccount}
        Close={() => this.setState({showLoginModal: false})}
      />
    );
  }

  Account(address) {
    const account = this.props.accounts.accounts[address];
    const profile = this.props.profiles.profiles[address];

    const isCurrentAccount = this.props.accounts.currentAccountAddress === account.address;
    const accountLocked = !account.signer;

    let selectAccountButton;
    if(!isCurrentAccount || accountLocked) {
      selectAccountButton = (
        <Action onClick={() => this.SelectAccount(account.address)}>
          {accountLocked ? "Unlock Account" : "Use Account"}
        </Action>
      );
    }

    let lockAccountButton;
    if(!accountLocked) {
      lockAccountButton = (
        <Action className="danger" onClick={() => this.LockAccount(account.address)}>
          Lock Account
        </Action>
      );
    }

    const profileImage = profile.imageUrl || DefaultAccountImage;

    return (
      <div key={`account-${account.address}`} className={isCurrentAccount ? "account current-account" : "account"}>
        <ImageIcon
          icon={accountLocked ? LockedIcon : UnlockedIcon}
          label={accountLocked ? "Account Locked" : "Account Unlocked"}
          className={`account-lock-icon ${accountLocked ? "" : "account-unlocked-icon"}`}
        />
        <IconButton
          icon={RemoveAccountIcon}
          label={"Remove Account"}
          onClick={() => this.RemoveAccount(account.address)}
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
            <div className="account-name">{profile.metadata.public.name || "\u00a0"}</div>
            <div className="account-address">{account.address}</div>
            <Balance balance={account.balance} className="account-balance" />
          </div>
          <div className="account-actions">
            { selectAccountButton }
            { lockAccountButton }
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="page-content">
        { this.LoginModal() }
        <div className="accounts">
          { this.props.accounts.sortedAccounts.map(address => this.Account(address)) }
        </div>
        <div className="actions-container flex-centered">
          <Action type="link" to="/accounts/add" label="Add Account">Add Account</Action>
        </div>
      </div>
    );
  }
}

export default Accounts;
