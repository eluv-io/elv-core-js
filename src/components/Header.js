import "../static/stylesheets/header.scss";

import React from "react";
import {
  Balance,
  CroppedIcon,
  IconButton,
  IconLink,
  onEnterPressed
} from "elv-components-js";
import {inject, observer} from "mobx-react";

import Logo from "../static/images/Logo.png";
import DefaultAccountImage from "../static/icons/User.svg";
import ShowHeaderIcon from "../static/icons/ShowHeader.svg";
import LockedIcon from "../static/icons/Locked.svg";
import UnlockedIcon from "../static/icons/Unlocked.svg";
import withRouter from "react-router/withRouter";
import {Link} from "react-router-dom";

const Account = ({
  name,
  address,
  imageUrl,
  balance,
  locked=false,
  onClick,
  onLock,
  className
}) => (
  <div
    aria-roledescription="button"
    tabIndex={0}
    onClick={onClick}
    onKeyPress={onEnterPressed(onClick)}
    className={className}
    key={`account-${address}`}
  >
    <CroppedIcon
      icon={imageUrl || DefaultAccountImage}
      alternateIcon={DefaultAccountImage}
      label={"Profile Image"}
      className="header-profile-image"
    />
    <div className="header-account-info">
      <div className={`header-account-name ${name ? "" : "header-account-name-address"}`}>
        { name || address }
      </div>
      <div className="header-account-balance">
        <Balance balance={balance} className="header-account-balance"/>
      </div>
    </div>
    <IconButton
      hidden={!address}
      icon={locked ? LockedIcon : UnlockedIcon}
      label={locked ? "Account Locked" : "Lock Account"}
      onClick={!locked && onLock ? onLock : undefined}
      className={`account-lock-icon ${locked ? "" : "account-unlocked-icon"}`}
    />
  </div>
);

@inject("root")
@inject("accounts")
@inject("profiles")
@observer
class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSelection: false
    };

    this.HandleClick = this.HandleClick.bind(this);
    this.AccountInfo = this.AccountInfo.bind(this);
    this.ToggleHeader = this.ToggleHeader.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.HandleClick);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.HandleClick);
  }

  HandleClick(event) {
    // Hide account selection on click outside
    if(!this.state.showSelection || this.node.contains(event.target)) { return; }

    this.setState({showSelection: false});
  }

  ToggleHeader(show) {
    this.props.root.ToggleHeader(show);
  }

  AccountSelection() {
    if(!this.state.showSelection) { return; }

    return (
      <div className="header-account-selection">
        <div className="header-accounts">
          {
            this.props.accounts.sortedAccounts
              .filter(address => address !== this.props.accounts.currentAccountAddress)
              .map(address => {
                const account = this.props.accounts.accounts[address];
                const profile = this.props.profiles.profiles[address];

                return Account({
                  name: profile.metadata.public.name,
                  address: account.address,
                  imageUrl: profile.imageUrl,
                  balance: account.balance,
                  locked: !account.signer,
                  onClick: () => {
                    this.props.accounts.SetCurrentAccount({address: account.address});
                    this.setState({showSelection: false});
                  },
                  onLock: event => {
                    event.stopPropagation();
                    this.props.accounts.LockAccount({address: account.address});
                  },
                  className: "header-account account-selection"
                });
              })
          }
        </div>
        <div className="accounts-button-container">
          <Link
            className="accounts-button" to="/accounts"
            onClick={() => this.setState({showSelection: false})}
          >
            Manage Accounts
          </Link>
        </div>
      </div>
    );
  }

  AccountInfo() {
    const account = this.props.accounts.currentAccount;
    const profile = this.props.profiles.currentProfile;

    if(account) {
      return Account({
        name: profile.metadata.public.name,
        address: account.address,
        imageUrl: profile.imageUrl,
        balance: account.balance,
        locked: !account.signer,
        onClick: () => this.setState({showSelection: !this.state.showSelection}),
        onLock: event => {
          event.stopPropagation();

          this.props.accounts.LockAccount({address: account.address});
          this.setState({showSelection: false});

          this.props.history.push("/accounts");
        },
        className: "header-account"
      });
    } else {
      return Account({
        name: "Not Logged In",
        className: "header-account"
      });
    }
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
        <div className="account-info-container" ref={node => this.node = node}>
          { this.AccountInfo() }
          { this.AccountSelection() }
        </div>
      </header>
    );
  }
}

export default withRouter(Header);
