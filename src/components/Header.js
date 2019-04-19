import "../static/stylesheets/header.scss";

import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import {
  Action,
  Balance,
  LoadingElement,
  CroppedIcon,
  IconButton,
  IconLink
} from "elv-components-js";

import Logo from "../static/images/Logo.png";
import DefaultAccountImage from "../static/icons/User.svg";
import ShowHeaderIcon from "../static/icons/ShowHeader.svg";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.AccountInfo = this.AccountInfo.bind(this);
    this.ToggleHeader = this.ToggleHeader.bind(this);
  }

  ToggleHeader(show) {
    this.props.ToggleHeader(show);
  }

  AccountInfo() {
    const profileImage = (this.props.account && this.props.account.profileImage) || DefaultAccountImage;
    const profileName = (this.props.account && (this.props.account.profile.name || this.props.account.address)) || "Not Logged In";
    const addressAsName = this.props.account && profileName === this.props.account.address;

    return (
      <Action type="link" label="Go to Accounts Page" to="/accounts" className="header-account" button={false}>
        <CroppedIcon icon={profileImage} label={"Profile Image"} className="header-profile-image"/>
        <div className="header-account-info">
          <div className={`header-account-name ${addressAsName ? "header-account-name-address" : ""}`}>
            {profileName}
          </div>
          <div className="header-account-balance">
            <Balance balance={this.props.account && this.props.account.balance} className="header-account-balance"/>
          </div>
        </div>
      </Action>
    );
  }

  render() {
    return (
      <header className={this.props.showHeader ? "header" : "header hidden-header"}>
        <IconButton className="toggle-header-button" icon={ShowHeaderIcon} label="Show Header" onClick={() => this.ToggleHeader(true)} />
        <IconLink icon={Logo} to="/apps" className="logo" />
        <div
          className="toggle-header-section"
          label="Hide Header"
          aria-label="Hide Header"
          tabIndex={0}
          onClick={() => this.ToggleHeader(false)}
          onKeyPress={() => this.ToggleHeader(false)}
        />
        <LoadingElement loading={false} render={this.AccountInfo} />
      </header>
    );
  }
}

export default ElvCoreConsumer(Header);
