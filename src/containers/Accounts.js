import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Accounts from "../components/Accounts";
import {GetAccountBalance, RemoveAccount as Remove} from "../actions/Accounts";
import {UnlockAccount as Unlock} from "../actions/Accounts";

const SwitchAccount = (context) => {
  return (address) => {
    context.UpdateContext({currentAccount: context.accounts[address]});
  };
};

const UnlockAccount = (context) => {
  return async ({address, password}) => {
    await Unlock({context, address, password});
  };
};

const RemoveAccount = (context) => {
  return (address) => {
    Remove({context, address});
  };
};

const AccountsContainer = ({context, props}) => {
  console.log("asd");
  const actions = {
    SwitchAccount: SwitchAccount(context),
    UnlockAccount: UnlockAccount(context),
    RemoveAccount: RemoveAccount(context),
  };

  Object.keys(context.accounts).forEach(address => {
    if(!context.accounts[address].balance) {
      GetAccountBalance({context, address})
    }
  });

  return (
    <Accounts
      accounts={context.accounts}
      currentAccount={context.currentAccount}
      actions={actions}
    />
  );
};

export default ElvCoreConsumer(AccountsContainer);
