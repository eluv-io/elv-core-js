import React from "react";
import {CroppedIcon, IconButton, ImageIcon} from "./components/Icons";
import connect from "react-redux/es/connect/connect";
import Logo from "../static/images/logo-dark.png";
import ShowButton from "../static/icons/show.svg";
import {HideHeader, ShowHeader} from "../actions/Routing";
import RequestElement from "./components/RequestElement";
import DefaultProfileImage from "../static/icons/account.svg";
import Action from "./components/Action";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.ShowHeader = this.ShowHeader.bind(this);
    this.HideHeader = this.HideHeader.bind(this);
    this.AccountInfo = this.AccountInfo.bind(this);
  }

  UpdateAccountInfo() {
    this.setState({
      requestId: this.props.WrapRequest({
        todo: async () => {
          if(this.props.accounts.currentAccount) {
            await this.props.GetProfileImage({
              client: this.props.client.client,
              accountAddress: this.props.accounts.currentAccount.accountAddress
            });
            await this.props.GetPublicUserProfile({
              client: this.props.client.client,
              accountAddress: this.props.accounts.currentAccount.accountAddress
            });
            await this.props.UpdateAccountBalance({
              client: this.props.client.client,
              accountAddress: this.props.accounts.currentAccount.accountAddress
            });
          }
        }
      })
    });
  }

  componentDidMount() {
    this.UpdateAccountInfo();
  }

  componentDidUpdate(oldProps) {
    if(this.props.accounts.currentAccount !== oldProps.accounts.currentAccount) {
      this.UpdateAccountInfo();
    }
  }

  UserProfile() {
    return this.props.accounts.userProfiles[this.props.accounts.currentAccount.accountAddress] || {publicMetadata: {}, privateMetadata: {}};
  }

  ShowHeader() {
    this.props.dispatch(ShowHeader());
  }

  HideHeader() {
    this.props.dispatch(HideHeader());
  }

  AccountInfo() {
    const account = this.props.accounts.currentAccount;
    const accountName = account ?
      this.UserProfile().publicMetadata.name || <div className="small-text">{account.accountAddress}</div> : "Not logged in";
    const accountBalance = account ? this.props.accounts.balances[account.accountAddress] : "";
    const accountImage = account ? this.UserProfile().profileImageUrl || DefaultProfileImage : DefaultProfileImage;

    return (
      <Action type="link" to="/accounts" className="current-account">
        <div className="account-info">
          <div className="account-name">
            { accountName }
          </div>
          <div className="account-balance">
            { accountBalance }
          </div>
        </div>
        <CroppedIcon icon={accountImage} containerClassname="profile-image"/>
      </Action>
    );
  }

  render() {
    return (
      <header className={this.props.routing.showHeader ? "header" : "header hidden-header"}>
        <IconButton className="toggle-header-button" src={ShowButton} title="Show Header" onClick={this.ShowHeader} />
        <Action type="link" className="logo-link" to="/">
          <div className="icon-container">
            <ImageIcon className="logo-icon" icon={Logo}/>
          </div>
        </Action>
        <div
          className="toggle-header-section"
          title="Hide Header"
          tabIndex={0}
          onClick={this.HideHeader}
          onKeyPress={this.HideHeader}
        />
        <RequestElement requestId={this.state.requestId} requests={this.props.requests} render={this.AccountInfo} />
      </header>
    );
  }
}

export default connect(
  (state) => state
)(Header);
