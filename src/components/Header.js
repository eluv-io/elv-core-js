import "../static/stylesheets/header.scss";

import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import {CroppedIcon, IconButton, IconLink} from "elv-components-js/src/components/Icons";
import Action from "elv-components-js/src/components/Action";
import LoadingElement from "elv-components-js/src/components/LoadingElement";

import Logo from "../static/images/Logo.png";
import AccountImage from "../static/icons/User.svg";
import ShowHeaderIcon from "../static/icons/ShowHeader.svg";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.AccountInfo = this.AccountInfo.bind(this);
    this.ToggleHeader = this.ToggleHeader.bind(this);
  }

  ToggleHeader(show) {
    this.props.actions.ToggleHeader(show);
  }

  AccountInfo() {
    return (
      <Action type="link" to="/accounts" className="header-account" button={false}>
        <CroppedIcon icon={AccountImage} className="profile-image"/>
        <div className="header-account-info">
          <div className="header-account-name">
            {this.props.currentAccount && this.props.currentAccount.address || "Not Logged In"}
          </div>
          <div className="header-account-balance">
            {this.props.currentAccount && this.props.currentAccount.balance}
          </div>
        </div>
      </Action>
    );
  }

  render() {
    return (
      <header className={this.props.showHeader ? "header" : "header hidden-header"}>
        <IconButton className="toggle-header-button" icon={ShowHeaderIcon} title="Show Header" onClick={() => this.ToggleHeader(true)} />
        <IconLink icon={Logo} to="/apps" className="logo" />
        <div
          className="toggle-header-section"
          title="Hide Header"
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
