import "../static/stylesheets/accounts.scss";

import React from "react";
import {Action, Balance, Confirm, CroppedIcon, ImageIcon} from "elv-components-js";
import LoginModal from "./LoginModal";

import LockedIcon from "../static/icons/Locked.svg";
import UnlockedIcon from "../static/icons/Unlocked.svg";
import DefaultAccountImage from "../static/icons/User.svg";

class Accounts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLoginModal: false,
      selectedAddress: ""
    };

    this.UnlockAccount = this.UnlockAccount.bind(this);
  }

  async SelectAccount(address) {
    if(this.props.accounts[address].signer) {
      await this.props.UnlockAccount({address});
      return;
    }

    this.setState({
      showLoginModal: true,
      selectedAddress: address
    });
  }

  async UnlockAccount(password) {
    await this.props.UnlockAccount({address: this.state.selectedAddress, password});
  }

  RemoveAccount(address) {
    Confirm({
      message: "Are you sure you want to remove this account?",
      onConfirm: () => this.props.RemoveAccount(address)
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

  Account(account) {
    const isCurrentAccount = this.props.currentAccount === account.address;
    const accountLocked = !account.signer;

    let selectAccountButton;
    if(!isCurrentAccount || accountLocked) {
      selectAccountButton = (
        <Action onClick={() => this.SelectAccount(account.address)}>
          {accountLocked ? "Unlock" : "Use Account"}
        </Action>
      );
    }

    const profileImage = account.profileImage || DefaultAccountImage;

    return (
      <div key={`account-${account.address}`} className={isCurrentAccount ? "account current-account" : "account"}>
        <ImageIcon
          icon={accountLocked ? LockedIcon : UnlockedIcon}
          label={accountLocked ? "Account Locked" : "Account Unlocked"}
          className={`account-lock-icon ${accountLocked ? "" : "account-unlocked-icon"}`}
        />
        <CroppedIcon icon={profileImage} label="Profile Image" className="account-image" />
        <div className="account-main">
          <div className="account-info">
            <div className="account-name">{account.profile.name || "\u00a0"}</div>
            <div className="account-address">{account.address}</div>
            <Balance balance={account.balance} className="account-balance" />
          </div>
          <div className="account-actions">
            { selectAccountButton }
            <Action className="delete-action" onClick={() => this.RemoveAccount(account.address)}>Remove</Action>
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
          { Object.values(this.props.accounts).map(account => this.Account(account)) }
        </div>
        <div className="actions-container flex-centered">
          <Action type="link" to="/accounts/add" label="Add Account">Add Account</Action>
        </div>
      </div>
    );
  }
}

export default Accounts;
