import "../static/stylesheets/accounts.scss";

import React from "react";
import {inject, observer} from "mobx-react";
import {Action, Balance, Confirm, CroppedIcon, IconButton, ImageIcon} from "elv-components-js";
import LoginModal from "./LoginModal";

import LockedIcon from "../static/icons/Locked.svg";
import UnlockedIcon from "../static/icons/Unlocked.svg";
import DefaultAccountImage from "../static/icons/User.svg";
import RemoveAccountIcon from "../static/icons/X.svg";

@inject("accountsStore")
@inject("profilesStore")
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
    if(this.props.accountsStore.accounts[address].signer) {
      await this.props.accountsStore.UnlockAccount({address});
      return;
    }

    this.setState({
      showLoginModal: true,
      selectedAddress: address
    });
  }

  async UnlockAccount({password}) {
    await this.props.accountsStore.UnlockAccount({address: this.state.selectedAddress, password});
  }

  LockAccount(address) {
    this.props.accountsStore.LockAccount({address});
  }

  RemoveAccount(address) {
    Confirm({
      message: "Are you sure you want to remove this account?",
      onConfirm: () => this.props.accountsStore.RemoveAccount(address)
    });
  }

  LoginModal() {
    if(!this.state.showLoginModal) { return; }

    return (
      <LoginModal
        key="password-prompt"
        legend={"Enter your password to unlock this account"}
        address={this.state.selectedAddress}
        fields={[{name: "password", label: "Password", type: "password"}]}
        Submit={this.UnlockAccount}
        Close={() => this.setState({showLoginModal: false})}
      />
    );
  }

  Account(address) {
    const account = this.props.accountsStore.accounts[address];
    const profile = this.props.profilesStore.profiles[address];

    const isCurrentAccount = this.props.accountsStore.currentAccountAddress === account.address;
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
          { this.props.accountsStore.sortedAccounts.map(address => this.Account(address)) }
        </div>
        <div className="actions-container flex-centered add-account">
          <Action type="link" to="/accounts/add" label="Add Account">Add Account</Action>
        </div>
      </div>
    );
  }
}

export default Accounts;
