import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Header from "../components/Header";
import {GetAccountBalance} from "../actions/Accounts";

const ToggleHeader = (context) => {
  return (show) => {
    context.UpdateContext({showHeader: show});
  };
};

const HeaderContainer = ({context, props}) => {
  const actions = {
    ToggleHeader: ToggleHeader(context)
  };

  const currentAccount = context.accounts[context.currentAccount];

  if(currentAccount && !currentAccount.balance) {
    GetAccountBalance({context, address: context.currentAccount});
  }

  return (
    <Header showHeader={context.showHeader} currentAccount={currentAccount} actions={actions} />
  );
};

export default ElvCoreConsumer(HeaderContainer);
