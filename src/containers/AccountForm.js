import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import AccountForm from "../components/AccountForm";
import {AddAccount} from "../actions/Accounts";

const Submit = (context) => {
  return async ({credentialType, privateKey, encryptedPrivateKey, mnemonic, password}) => {
    const wallet = context.client.GenerateWallet();

    switch (credentialType) {
      case "mnemonic":
        privateKey = wallet.AddAccountFromMnemonic({mnemonic}).signingKey.privateKey;
        break;
      case "encryptedPrivateKey":
        privateKey = (await wallet.AddAccountFromEncryptedPK({encryptedPrivateKey, password})).signingKey.privateKey;
    }

    await AddAccount({context, privateKey, password});
  };
};

const GenerateMnemonic = (context) => {
  return () => context.client.GenerateWallet().GenerateMnemonic();
};

const AccountFormContainer = ({context, props}) => {
  const actions = {
    GenerateMnemonic: GenerateMnemonic(context),
    Submit: Submit(context)
  };

  return (
    <AccountForm accounts={context.accounts} currentAccount={context.currentAccount} {...actions} />
  );
};

export default ElvCoreConsumer(AccountFormContainer);
