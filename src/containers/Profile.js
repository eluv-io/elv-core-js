import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Profile from "../components/Profile";

const ProfileContainer = ({context, props}) => {
  const currentAccount = context.accounts[context.currentAccount];

  return (
    <Profile currentAccount={currentAccount} />
  );
};

export default ElvCoreConsumer(ProfileContainer);
