import "../static/stylesheets/accounts.scss";

import React from "react";
import Action from "elv-components-js/src/components/Action";
import {CroppedIcon, ImageIcon} from "elv-components-js/src/components/Icons";
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
    if(confirm("Are you sure you want to remove this account?")) {
      this.props.RemoveAccount(address);
    }
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
          {accountLocked ? "Unlock Account" : "Use Account"}
        </Action>
      );
    }

    const profileImage = account.profileImage || DefaultAccountImage;

    return (
      <div key={`account-${account.address}`} className={isCurrentAccount ? "account current-account" : "account"}>
        <ImageIcon
          icon={accountLocked ? LockedIcon : UnlockedIcon}
          title={accountLocked ? "Account Locked" : "Account Unlocked"}
          className="account-lock-icon"
        />
        <CroppedIcon icon={profileImage} title="Profile Image" className="account-image" />
        <div className="account-info">
          <div className="account-name">{account.profile.name || "\u00a0"}</div>
          <div className="account-address">{account.address}</div>
          <div className="account-balance">{account.balance}</div>
        </div>
        <div className="account-actions">
          { selectAccountButton }
          <Action className="delete-action" onClick={() => this.RemoveAccount(account.address)}>Remove Account</Action>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="page-content">
        { this.LoginModal() }
        <div className="actions-container flex-centered">
          <Action type="link" to="/accounts/add" title="Add Account">Add Account</Action>
        </div>
        <div className="accounts">
          { Object.values(this.props.accounts).map(account => this.Account(account)) }
        </div>
      </div>
    );
  }
}

export default Accounts;
