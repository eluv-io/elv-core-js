import React from "react";
import Redirect from "react-router/es/Redirect";
import Path from "path";
import {SetErrorMessage} from "../actions/Notifications";

const Authenticate = (Component) => {
  return (props) => {
    if (props.client.client.signer) { return <Component {...props} />; }

    const currentAccount = props.accounts.accountManager.CurrentAccount();
    if(currentAccount) {
      props.dispatch(SetErrorMessage({
        message: "Authentication Required",
        redirect: true
      }));

      return <Redirect to={Path.join("/accounts", "log-in", currentAccount.accountAddress)} />;
    } else {
      props.dispatch(SetErrorMessage({
        message: "Please add an account",
        redirect: true
      }));

      return <Redirect to={Path.join("/accounts")} />;
    }
  };
};

export default Authenticate;
