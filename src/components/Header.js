import "../static/stylesheets/header.scss";

import React from "react";
import {
  Action,
  Balance,
  CroppedIcon,
  IconButton,
  IconLink
} from "elv-components-js";

import Logo from "../static/images/Logo.png";
import DefaultAccountImage from "../static/icons/User.svg";
import ShowHeaderIcon from "../static/icons/ShowHeader.svg";
import {inject, observer} from "mobx-react";

@inject("root")
@inject("accounts")
@inject("profiles")
@observer
class Header extends React.Component {
  constructor(props) {
    super(props);

    this.AccountInfo = this.AccountInfo.bind(this);
    this.ToggleHeader = this.ToggleHeader.bind(this);
  }

  ToggleHeader(show) {
    this.props.root.ToggleHeader(show);
  }

  AccountInfo() {
    const account = this.props.accounts.currentAccount;
    const profile = this.props.profiles.currentProfile;

    const profileName = account ? profile.metadata.public.name || account.address : "Not Logged In";
    const addressAsName = account ? profileName === account.address : "";

    return (
      <Action type="link" label="Go to Accounts Page" to="/accounts" className="header-account" button={false}>
        <CroppedIcon
          key={`account-image-${account ? account.address : "unknown-account"}`}
          icon={profile.imageUrl || DefaultAccountImage}
          alternateIcon={DefaultAccountImage}
          label={"Profile Image"}
          className="header-profile-image"
        />
        <div className="header-account-info">
          <div className={`header-account-name ${addressAsName ? "header-account-name-address" : ""}`}>
            {profileName}
          </div>
          <div className="header-account-balance">
            <Balance balance={account ? account.balance : ""} className="header-account-balance"/>
          </div>
        </div>
      </Action>
    );
  }

  render() {
    return (
      <header className={this.props.root.showHeader ? "header" : "header hidden-header"}>
        <IconButton className="toggle-header-button" icon={ShowHeaderIcon} label="Show Header" onClick={() => this.ToggleHeader(true)} />
        <IconLink icon={Logo} to="/apps" className="logo" />
        <div
          className="toggle-header-section"
          title="Hide Header"
          aria-label="Hide Header"
          tabIndex={0}
          onClick={() => this.ToggleHeader(false)}
          onKeyPress={() => this.ToggleHeader(false)}
        />
        { this.AccountInfo() }
      </header>
    );
  }
}

export default Header;
