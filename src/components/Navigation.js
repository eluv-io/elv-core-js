import "../static/stylesheets/navigation.scss";

import React from "react";
import NavLink from "react-router-dom/es/NavLink";
import PropTypes from "prop-types";

const Navigation = (props) => {
  const lowBalance = props.balance < 0.1;
  const lowBalanceWarning = props.unlocked && lowBalance ?
    <div className="warning">This account has an insufficient balance. Please fund the account.</div> :
    null;
  if(!props.unlocked || lowBalance) {
    return (
      <div className="nav-container locked">
        { lowBalanceWarning }
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

Navigation.propTypes = {
  unlocked: PropTypes.bool.isRequired,
  balance: PropTypes.number.isRequired
};

export default Navigation;
