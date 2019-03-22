import React from "react";
import Action from "elv-components-js/src/components/Action";
import {CroppedIcon} from "elv-components-js/src/components/Icons";

import AccountImage from "../static/icons/User.svg";
import Redirect from "react-router/es/Redirect";

class Accounts extends React.Component {
  // TODO: Redirect to account switcher if no accounts
  render() {
    if(!this.props.currentAccount) {
      return <Redirect to="/accounts" />
    }

    return (
      <div className="page-container">
        <div className="profile">
          <div className="account">
            <CroppedIcon icon={AccountImage} className="account-image" />
            <div className="account-info">
              <div>Account Name</div>
              <div>0x71b011B67dc8f5C323A34Cd14b952721D5750C93</div>
              <div>1234.123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Accounts;
