import React from "react";
import connect from "react-redux/es/connect/connect";
import Link from "react-router-dom/es/Link";
import {LogOut, RemoveAccount, SwitchAccount} from "../actions/Accounts";

import {ImageIcon} from "./Icons";
import AccountIcon from "../static/images/portrait2.png";
import Redirect from "react-router/es/Redirect";
import Path from "path";

class Accounts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginRedirect: false,
      loginAccount: ""
    };
  }

  HandleRemoveAccount(account) {
    if(this.props.accounts.currentAccount && this.props.accounts.currentAccount.accountAddress === account.accountAddress) {
      if(confirm("Are you sure you want to log out?")) {
        this.props.dispatch(LogOut({
          client: this.props.client.client,
          accountManager: this.props.accounts.accountManager
        }));
      }
    } else {
      if(confirm("Are you sure you want to remove this account?")) {
        this.props.dispatch(RemoveAccount({
          client: this.props.client.client,
          accountName: account.accountName,
          accountManager: this.props.accounts.accountManager
        }));
      }
    }
  }

  SwitchAccount(account) {
    this.props.dispatch(SwitchAccount({
      client: this.props.client.client,
      accountManager: this.props.accounts.accountManager,
      account
    }));
  }

  AccountActions(account, currentAccount=false) {
    if(!currentAccount) { return null; }

    return (
      <div className="actions-container account-actions">
        <Link className="action action-compact action-wide" to={Path.join(this.props.match.url, "transfer")}>
          Transfer Funds
        </Link>
      </div>
    );
  }

  Account(account, currentAccount=false) {
    return (
      <div
        onClick={() => {
          if(!currentAccount) {
            this.SwitchAccount(account);
          }
        }}
        key={"account-" + account.accountAddress}
        className={"account-container " + (currentAccount ? "current-account" : "")}
      >
        <div className="icon-container">
          <div className="cropped-image">
            <ImageIcon className="account-icon" icon={AccountIcon} />
          </div>
        </div>
        <div className="info-container">
          <div className="account-header">
            <div className="account-name">
              { account.accountName }
            </div>
            <div className="actions-container remove-actions" onClick={(e) => { e.stopPropagation(); }} >
              <button
                className="action action-compact secondary"
                onClick={() => this.HandleRemoveAccount(account)}
              >
                { currentAccount ? "Log Out" : "Remove" }
              </button>
            </div>
          </div>
          <div className="account-address" >
            { account.accountAddress }
          </div>
        </div>
        { this.AccountActions(account, currentAccount) }
      </div>
    );
  }

  Accounts() {
    const currentAccount = this.props.accounts.currentAccount;

    return Object.keys(this.props.accounts.activeAccounts)
      .filter(accountAddress => currentAccount.accountAddress !== accountAddress)
      .map(accountAddress => this.Account(this.props.accounts.activeAccounts[accountAddress]));
  }

  CurrentAccount() {
    const currentAccount = this.props.accounts.currentAccount;

    if(!currentAccount) { return; }

    return this.Account(currentAccount, true);
  }

  render() {
    if(this.state.loginRedirect) {
      return <Redirect to={Path.join("/accounts", "log-in", this.state.loginAccount)} />;
    }

    return (
      <div className="accounts-container main-content-container">
        <div className="accounts">
          { this.CurrentAccount() }
          { this.Accounts() }
          <div className="actions-container add-account-container">
            <Link className="action action-compact action-wide" to="/accounts/add-account">
              Add Account
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => state
)(Accounts);

