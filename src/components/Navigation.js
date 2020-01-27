import "../static/stylesheets/navigation.scss";

import React from "react";
import {NavLink} from "react-router-dom";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router";

@inject("accounts")
@observer
class Navigation extends React.Component {
  render() {
    if(this.props.location && this.props.location.pathname.match(/^\/apps\/.+$/)) {
      // App frame is visible - hide navigation
      return null;
    }

    const account = this.props.accounts.currentAccount;

    if(!account) {
      return (
        <div className="nav-container locked">
          <nav>
            <NavLink activeClassName="active" to="/accounts">Accounts</NavLink>
          </nav>
        </div>
      );
    } else if(account.balance < 0.1) {
      return (
        <div className="nav-container locked">
          <div className="warning">This account has an insufficient balance. Please fund the account.</div>
          <nav>
            <NavLink activeClassName="active" to="/accounts">Accounts</NavLink>
          </nav>
        </div>
      );
    } else {
      return (
        <div className="nav-container">
          <nav>
            <NavLink exact={true} activeClassName="active" to="/apps">Apps</NavLink>
            <NavLink activeClassName="active" to="/profile">Profile</NavLink>
            <NavLink activeClassName="active" to="/accounts">Accounts</NavLink>
            <NavLink exact={true} activeClassName="active" to="/transfer">Transfer</NavLink>
          </nav>
        </div>
      );
    }
  }
}

export default withRouter(Navigation);
