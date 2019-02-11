import React from "react";
import connect from "react-redux/es/connect/connect";

import {CroppedIcon} from "./components/Icons";
import DefaultProfileImage from "../static/icons/account.svg";
import Redirect from "react-router/es/Redirect";
import Path from "path";
import RequestElement from "./components/RequestElement";
import {FormatAddress} from "../utils/Helpers";
import Action from "./components/Action";

class Accounts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginRedirect: false
    };

    this.Accounts = this.Accounts.bind(this);
  }

  componentDidMount() {
    this.setState({
      requestId: this.props.WrapRequest({
        todo: async () => {
          await Promise.all(
            Object.keys(this.props.accounts.activeAccounts).map(async accountAddress => {
              await this.props.GetProfileImage({client: this.props.client.client, accountAddress});
              await this.props.GetPublicUserProfile({client: this.props.client.client, accountAddress});
            })
          );
        }
      })
    });
  }

  UserProfile(accountAddress) {
    return this.props.accounts.userProfiles[FormatAddress(accountAddress)]
      || {publicMetadata: {}, privateMetadata: {}, profileImageUrl: ""};
  }

  HandleRemoveAccount(account) {
    if(this.props.accounts.currentAccount && this.props.accounts.currentAccount.accountAddress === account.accountAddress) {
      if(confirm("Are you sure you want to log out?")) {
        this.props.LogOut({
          client: this.props.client.client,
          accountManager: this.props.accounts.accountManager
        });
      }
    } else {
      if(confirm("Are you sure you want to remove this account?")) {
        this.props.RemoveAccount({
          client: this.props.client.client,
          accountAddress: account.accountAddress,
          accountManager: this.props.accounts.accountManager
        });
      }
    }
  }

  SwitchAccount(account) {
    this.props.SwitchAccount({
      client: this.props.client.client,
      accountManager: this.props.accounts.accountManager,
      account
    });

    this.setState({
      loginRedirect: true
    });
  }

  AccountActions(account, currentAccount=false) {
    if(!currentAccount) { return null; }

    return (
      <div className="actions-container account-actions">
        <Action type="link" className="action action-compact" to={Path.join(this.props.match.url, account.accountAddress, "profile")}>
          Profile
        </Action>
        <Action type="link" className="action action-compact" to={Path.join(this.props.match.url, "transfer")}>
          Transfer Funds
        </Action>
      </div>
    );
  }

  Account(account) {
    const currentAccount = account.accountAddress === this.props.accounts.currentAccount.accountAddress;
    const name = this.UserProfile(account.accountAddress).publicMetadata.name || "Unknown Account";
    const profileImage = this.UserProfile(account.accountAddress).profileImageUrl || DefaultProfileImage;

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
        <CroppedIcon icon={profileImage} containerClassname="profile-image" />
        <div className="info-container">
          <div className="account-header">
            <div className="account-name">
              { name }
            </div>
            <div className="actions-container remove-actions" onClick={(e) => { e.stopPropagation(); }} >
              <Action
                className="action action-compact tertiary"
                onClick={() => this.HandleRemoveAccount(account)}
              >
                { currentAccount ? "Log Out" : "Remove" }
              </Action>
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
    const accounts = Object.keys(this.props.accounts.activeAccounts)
      .map(accountAddress => this.Account(this.props.accounts.activeAccounts[accountAddress]));

    return (
      <div className="accounts-container main-content-container">
        <div className="actions-container centered">
          <Action type="link" to="/apps" className="action tertiary">Apps</Action>
        </div>
        <div className="accounts">
          { accounts }
          <div className="actions-container add-account-container">
            <Action type="link" className="action action-compact action-wide" to="/accounts/add-account">
              Add Account
            </Action>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if(this.state.loginRedirect && !this.props.client.signer && this.props.accounts.currentAccount) {
      return <Redirect to={Path.join("/accounts", this.props.accounts.currentAccount.accountAddress, "log-in")} />;
    }

    return <RequestElement requestId={this.state.requestId} requests={this.props.requests} render={this.Accounts}/>;
  }
}

export default connect(
  (state) => state
)(Accounts);

