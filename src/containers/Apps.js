import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Apps from "../components/Apps";

const AppsContainer = ({context, props}) => {
  return (
    <Apps apps={context.apps} />
  );
};

export default ElvCoreConsumer(AppsContainer);
