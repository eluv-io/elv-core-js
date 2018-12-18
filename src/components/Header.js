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
    const accountName = this.props.accounts.currentAccount ? this.props.accounts.currentAccount.accountName : "Not logged in";
    const accountImage = this.props.accounts.currentAccount ? AccountImage : UnknownAccountImage;

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
              { this.props.accounts.balances[accountName] }
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
