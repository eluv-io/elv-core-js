import React from "react";
import {IconButton, ImageIcon} from "./Icons";
import Link from "react-router-dom/es/Link";
import connect from "react-redux/es/connect/connect";

import UnknownAccountImage from "../static/images/UnknownUser.jpg";
import AccountImage from "../static/images/portrait2.png";
import Logo from "../static/images/logo-dark.png";
import ShowButton from "../static/icons/show.svg";
import {HideHeader, ShowHeader} from "../actions/Routing";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.ShowHeader = this.ShowHeader.bind(this);
    this.HideHeader = this.HideHeader.bind(this);
  }

  ShowHeader() {
    this.props.dispatch(ShowHeader());
  }

  HideHeader() {
    this.props.dispatch(HideHeader());
  }

  render() {
    const account = this.props.accounts.currentAccount;
    const accountName = account ? account.accountName : "Not logged in";
    const accountBalance = account ? this.props.accounts.balances[account.accountAddress] : "";
    const accountImage = account ? AccountImage : UnknownAccountImage;

    return (
      <header className={this.props.routing.showHeader ? "header" : "header hidden-header"}>
        <IconButton className="toggle-header-button" src={ShowButton} title="Show Header" onClick={this.ShowHeader} />
        <Link className="logo-link" to="/">
          <div className="icon-container">
            <ImageIcon className="logo-icon" icon={Logo}/>
          </div>
        </Link>
        <div
          className="toggle-header-section"
          title="Hide Header"
          tabIndex={0}
          onClick={this.HideHeader}
          onKeyPress={this.HideHeader}
        />
        <Link to="/accounts" className="current-account">
          <div className="account-info">
            <div className="account-name">
              { accountName }
            </div>
            <div className="account-balance">
              { accountBalance }
            </div>
          </div>
          <div className="icon-container">
            <div className="cropped-image">
              <ImageIcon icon={accountImage}/>
            </div>
          </div>
        </Link>
      </header>
    );
  }
}

export default connect(
  (state) => state
)(Header);
