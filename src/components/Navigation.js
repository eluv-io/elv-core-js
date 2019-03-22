import "../static/stylesheets/navigation.scss";

import React from "react";
import NavLink from "react-router-dom/es/NavLink";

const Navigation = (props) => {
  if(!props.currentAccount || !props.currentAccount.signer) {
    return (
      <div className="nav-container locked">
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


};

export default Navigation;
