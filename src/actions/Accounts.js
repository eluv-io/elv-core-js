import ActionTypes from "./ActionTypes";
import { SetErrorMessage, SetNotificationMessage } from "./Notifications";
import { WrapRequest } from "./Requests";

export const UpdateAccountBalance = ({client, accountManager, accountName}) => {
  return async (dispatch) => {
    const account = accountManager.GetAccount({accountName});

    if(!account) { return; }

    const balance = await client.GetBalance({address: account.accountAddress});

    dispatch({
      type: ActionTypes.accounts.updateAccountBalance,
      accountName,
      balance
    });
  };
};

// Update account state and balances
export const SetAccounts = ({client, accountManager}) => {
  return (dispatch) => {
    const currentAccount = accountManager.CurrentAccount();
    dispatch({
      type: ActionTypes.accounts.setAccounts,
      accounts: accountManager.Accounts(),
      currentAccount
    });

    if(client) {
      Object.values(accountManager.Accounts()).forEach(account => {
        dispatch(UpdateAccountBalance({client, accountManager, accountName: account.accountName}));
      });
    }
  };
};

export const LogIn = ({
  accountName,
  password,
  accountManager
}) => {
  return (dispatch) => {
    return WrapRequest({
      dispatch,
      action: "logIn",
      todo: async () => {
        const account = await accountManager.Authenticate({accountName, password});

        dispatch(SwitchAccount({account, accountManager}));

        dispatch(SetNotificationMessage({
          message: "Login successful",
          redirect: true
        }));
      }
    });
  };
};

export const AddAccount = ({
  client,
  accountManager,
  accountName,
  privateKey,
  encryptedPrivateKey,
  mnemonic,
  password,
}) => {
  return (dispatch) => {
    return WrapRequest({
      dispatch,
      action: "addAccount",
      todo: async () => {
        const account = await accountManager.AddAccount({
          accountName,
          privateKey,
          encryptedPrivateKey,
          mnemonic,
          password
        });

        // If no current account, set new account as current
        if(!accountManager.CurrentAccount()) {
          dispatch(SwitchAccount({ account, accountManager }));
        }

        dispatch(SetAccounts({client, accountManager}));

        dispatch(SetNotificationMessage({
          message: "Successfully added new account",
          redirect: true
        }));
      }
    });
  };
};

// TODO: remove noFlash parameter when seed doesn't need it
export const SwitchAccount = ({ client, accountManager, account, noFlash=false }) => {
  return (dispatch) => {
    if(account) {
      accountManager.SwitchAccount({accountName: account.accountName});

      // Update client with signer
      const signer = accountManager.GetAccount({accountName: account.accountName}).signer;
      dispatch({
        type: ActionTypes.client.setSigner,
        signer
      });
    } else {
      // Clear current account
      accountManager.SwitchAccount({});
      dispatch({
        type: ActionTypes.client.clearSigner
      });
    }

    dispatch(SetAccounts({accountManager}));

    if(!noFlash) {
      dispatch(SetNotificationMessage({message: "Successfully switched accounts"}));
    }
  };
};

export const LogOut = ({client, accountManager}) => {
  return (dispatch) => {
    let currentAccount = accountManager.CurrentAccount();
    if (!currentAccount) {
      dispatch(SetErrorMessage({message: "Not logged in"}));
      return;
    }

    dispatch(RemoveAccount({
      accountName: currentAccount.accountName,
      accountManager
    }));

    // Switch to another account if any exist
    // If no other accounts exist, SwitchAccount will clear currentAccount, logging out
    let accounts = accountManager.Accounts();
    delete accounts[currentAccount.accountName];
    let firstAccount = accounts[Object.keys(accounts)[0]];
    dispatch(SwitchAccount({client, account: firstAccount, accountManager}));

    dispatch(SetNotificationMessage({message: "Successfully logged out"}));
  };
};

export const RemoveAccount = ({ client, accountManager, accountName }) => {
  return (dispatch) => {
    let accountInfo = accountManager.GetAccount({accountName});

    if (!accountInfo) {
      dispatch(SetErrorMessage({message: "Invalid account: " + accountName}));
      return;
    }

    accountManager.RemoveAccount({accountName});

    dispatch(SetNotificationMessage({message: "Successfully removed account"}));

    dispatch(SetAccounts({client, accountManager}));
  };
};

export const SendFunds = ({ client, accountManager, recipient, ether }) => {
  return (dispatch) => {
    return WrapRequest({
      dispatch,
      action: "sendFunds",
      todo: async () => {
        await client.SendFunds({
          recipient,
          ether
        });

        const recipientInfo = accountManager.GetAccountByAddress({accountAddress: recipient});
        const recipientName = recipientInfo ? recipientInfo.accountName : recipient;

        dispatch(UpdateAccountBalance({
          client,
          accountManager: accountManager,
          accountName: accountManager.CurrentAccount().accountName
        }));

        dispatch(SetNotificationMessage({
          message: "Successfully sent φ" + ether + " to " + recipientName,
          redirect: true
        }));
      }
    });
  };
};
