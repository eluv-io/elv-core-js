import "../static/stylesheets/header.scss";

import React from "react";
import {
  Balance,
  CroppedIcon,
  IconButton,
  onEnterPressed
} from "elv-components-js";
import {inject, observer} from "mobx-react";

import DefaultAccountImage from "../static/icons/User.svg";
import LockedIcon from "../static/icons/Locked.svg";
import UnlockedIcon from "../static/icons/Unlocked.svg";
import {withRouter} from "react-router";
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

@inject("accountsStore")
@observer
class AccountDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showSelection: false
    };

    this.HandleClick = this.HandleClick.bind(this);
    this.AccountInfo = this.AccountInfo.bind(this);
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

  AccountSelection() {
    if(!this.state.showSelection) { return; }

    return (
      <div className="header-account-selection">
        <div className="header-accounts">
          {
            this.props.accountsStore.sortedAccounts
              .filter(address => address !== this.props.accountsStore.currentAccountAddress)
              .map(address => {
                const account = this.props.accountsStore.accounts[address];

                return Account({
                  name: account.name,
                  address: account.address,
                  imageUrl: this.props.accountsStore.ResizeImage(account.imageUrl, 200),
                  balance: account.balance,
                  locked: !account.signer,
                  onClick: () => {
                    this.props.accountsStore.SetCurrentAccount({address: account.address});
                    this.setState({showSelection: false});
                  },
                  onLock: event => {
                    event.stopPropagation();
                    this.props.accountsStore.LockAccount({address: account.address});
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
    const account = this.props.accountsStore.currentAccount;

    if(account) {
      return Account({
        name: account.name,
        address: account.address,
        imageUrl: this.props.accountsStore.ResizeImage(account.imageUrl, 200),
        balance: account.balance,
        locked: !account.signer,
        onClick: () => this.setState({showSelection: !this.state.showSelection}),
        onLock: event => {
          event.stopPropagation();

          this.props.accountsStore.LockAccount({address: account.address});
          this.setState({showSelection: false});

          this.props.history.push("/accounts");
        },
        className: "header-account main-account"
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
      <div className="account-info-container" ref={node => this.node = node}>
        { this.AccountInfo() }
        { this.AccountSelection() }
      </div>
    );
  }
}

export default withRouter(AccountDropdown);
