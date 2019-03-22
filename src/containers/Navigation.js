import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Navigation from "../components/Navigation";
import withRouter from "react-router/es/withRouter";

const NavigationContainer = ({context, props}) => {
  if(props.location && props.location.pathname.match(/^\/apps\/.+$/)) {
    return;
  }

  const currentAccount = context.accounts[context.currentAccount];

  return (
    <Navigation currentAccount={currentAccount} />
  );
};

export default withRouter(ElvCoreConsumer(NavigationContainer));
