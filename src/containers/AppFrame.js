import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import AppFrame from "../components/AppFrame";
import Redirect from "react-router/es/Redirect";

const AppFrameContainer = ({context, props}) => {
  const name = props.match.params.app;
  const url = context.apps[name];

  if(!url) {
    return <Redirect to="/apps" />;
  }

  return (
    <AppFrame client={context.client} app={{name, url}} />
  );
};

export default ElvCoreConsumer(AppFrameContainer);
