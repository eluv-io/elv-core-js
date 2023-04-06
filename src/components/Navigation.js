import "../static/stylesheets/navigation.scss";

import React from "react";
import {NavLink} from "react-router-dom";
import {inject, observer} from "mobx-react";
import {withRouter} from "react-router";
import {AppRoutes} from "../Routes";

@inject("accountsStore")
@observer
class Navigation extends React.Component {
  SiteNav() {
    // <a href="https://github.com/eluv-io" target="_blank">Docs</a>
    return (
      <div className="site-nav-container">
        <nav>
          <NavLink
            isActive={() => !!AppRoutes.find(({path}) => path === this.props.location.pathname)}
            activeClassName="active" to="/accounts"
          >
            Account
          </NavLink>

          <NavLink activeClassName="active" to="/offerings">Offerings</NavLink>
          <NavLink activeClassName="active" to="/terms">Terms</NavLink>
          <NavLink activeClassName="active" to="/privacy">Privacy</NavLink>
        </nav>
      </div>
    );
  }

  AppNav() {
    if(!AppRoutes.find(({path}) => path === this.props.location.pathname)) {
      return null;
    }

    const account = this.props.accountsStore.currentAccount;

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
            <NavLink exact={true} activeClassName="active" to="/apps">Apps & Tools</NavLink>
            <NavLink activeClassName="active" to="/profile">Profile</NavLink>
            <NavLink activeClassName="active" to="/accounts">Accounts</NavLink>
            <NavLink exact={true} activeClassName="active" to="/transfer">Transfer</NavLink>
          </nav>
        </div>
      );
    }
  }

  render() {
    if(this.props.location && this.props.location.pathname.match(/^\/apps\/.+$/)) {
      // App frame is visible - hide navigation
      return null;
    }

    return (
      <React.Fragment>
        { this.SiteNav() }
        { this.AppNav() }
      </React.Fragment>
    );
  }
}

export default withRouter(Navigation);
