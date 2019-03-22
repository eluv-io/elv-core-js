import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import TransferForm from "../components/TransferForm";
import {SendFunds} from "../actions/Accounts";

const Submit = (context) => {
  return async ({recipient, ether}) => {
    await SendFunds({context, recipient, ether});
  };
};

const TransferFormContainer = ({context, props}) => {
  const actions = {
    Submit: Submit(context)
  };

  // Filter out current account
  let accounts = {};
  Object.keys(context.accounts)
    .filter(address => address !== context.currentAccount)
    .forEach(address => accounts[address] = context.accounts[address]);

  return (
    <TransferForm accounts={accounts} currentAccount={context.currentAccount} {...actions} />
  );
};

export default ElvCoreConsumer(TransferFormContainer);
