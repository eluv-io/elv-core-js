import React from "react";
import Redirect from "react-router/es/Redirect";
import Path from "path";
import {AuthenticationFailure} from "../actions/Accounts";

const Authenticate = (Component) => {
  return (props) => {
    if (props.client.client.signer) { return <Component {...props} />; }

    const currentAccount = props.accounts.accountManager.CurrentAccount();
    let errorMessage, redirectLocation;
    if(currentAccount) {
      redirectLocation = Path.join("/accounts", currentAccount.accountAddress, "log-in");
    } else {
      errorMessage = "Please add an account";
      redirectLocation = Path.join("/accounts");
    }

    if(redirectLocation) {
      props.dispatch(AuthenticationFailure({
        message: errorMessage,
        originalLocation: props.location.pathname
      }));
    }

    return <Redirect to={redirectLocation} />;
  };
};

export default Authenticate;
