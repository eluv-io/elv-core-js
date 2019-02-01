import React from "react";
import {IconButton, ImageIcon} from "./Icons";
import Link from "react-router-dom/es/Link";
import connect from "react-redux/es/connect/connect";

import UnknownAccountImage from "../static/images/UnknownUser.jpg";
import AccountImage from "../static/images/portrait2.png";
import Logo from "../static/images/logo-dark.png";
import ShowButton from "../static/icons/show.svg";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: true
    };
  }

  Header() {
    const account = this.props.accounts.currentAccount;
    const accountName = account ? account.accountName : "Not logged in";
    const accountBalance = account ? this.props.accounts.balances[account.accountAddress] : "";
    const accountImage = account ? AccountImage : UnknownAccountImage;

    return [
      <IconButton className="toggle-header-button" src={ShowButton} title="Show Header" onClick={() => this.setState({show: true})} />,
      <Link className="logo-link" to="/">
        <div className="icon-container">
          <ImageIcon className="logo-icon" icon={Logo}/>
        </div>
      </Link>,
      <div
        className="toggle-header-section"
        title="Hide Header"
        tabIndex={0}
        onClick={() => this.setState({show: false})}
        onKeyPress={() => this.setState({show: false})}
      />,
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
    ];
  }

  render() {
    return (
      <header className={this.state.show ? "header" : "header hidden-header"}>
        {this.Header()}
      </header>
    );
  }
}

export default connect(
  (state) => state
)(Header);
