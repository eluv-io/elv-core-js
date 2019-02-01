import React from "react";
import ImageIcon from "./ImageIcon";
import Link from "react-router-dom/es/Link";
import connect from "react-redux/es/connect/connect";

import UnknownAccountImage from "../static/images/UnknownUser.jpg";
import AccountImage from "../static/images/portrait2.png";
import Logo from "../static/images/logo-dark.png";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const account = this.props.accounts.currentAccount;
    const accountName = account ? account.accountName : "Not logged in";
    const accountBalance = account ? this.props.accounts.balances[account.accountAddress] : "";
    const accountImage = account ? AccountImage : UnknownAccountImage;

    return (
      <header className="header">
        <Link className="logo-link" to="/">
          <div className="icon-container">
            <ImageIcon className="logo-icon" icon={Logo}/>
          </div>
        </Link>
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
