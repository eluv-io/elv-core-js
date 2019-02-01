import ActionTypes from "./ActionTypes";
import { SetErrorMessage, SetNotificationMessage } from "./Notifications";
import { WrapRequest } from "./Requests";

export const UpdateAccountBalance = ({client, accountAddress}) => {
  return async (dispatch) => {
    const balance = await client.GetBalance({address: accountAddress});

    dispatch({
      type: ActionTypes.accounts.updateAccountBalance,
      accountAddress,
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
      Object.keys(accountManager.Accounts()).forEach(accountAddress => {
        dispatch(UpdateAccountBalance({client, accountAddress}));
      });
    }
  };
};

export const LogIn = ({
  client,
  accountAddress,
  password,
  accountManager
}) => {
  return (dispatch) => {
    return WrapRequest({
      dispatch,
      action: "logIn",
      todo: async () => {
        const account = await accountManager.Authenticate({accountAddress, password});

        dispatch(SwitchAccount({client, account, accountManager}));

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
          dispatch(SwitchAccount({client, account, accountManager}));
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
export const SwitchAccount = ({client, accountManager, account, noFlash=false}) => {
  return (dispatch) => {
    if(account) {
      accountManager.SwitchAccount({accountAddress: account.accountAddress});

      // Update client with signer
      const signer = accountManager.GetAccount({accountAddress: account.accountAddress}).signer;
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

    dispatch(UpdateAccountBalance({client, accountAddress: account.accountAddress}));

    dispatch(SetAccounts({accountManager}));

    dispatch({type: ActionTypes.accounts.clearSavedLocation});

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
      accountAddress: currentAccount.accountAddress,
      accountManager
    }));

    // Switch to another account if any exist
    // If no other accounts exist, SwitchAccount will clear currentAccount, logging out
    let accounts = accountManager.Accounts();
    delete accounts[currentAccount.accountAddress];
    let firstAccount = accounts[Object.keys(accounts)[0]];
    dispatch(SwitchAccount({client, account: firstAccount, accountManager}));

    dispatch(SetNotificationMessage({message: "Successfully logged out"}));
  };
};

export const RemoveAccount = ({ client, accountManager, accountAddress }) => {
  return (dispatch) => {
    let accountInfo = accountManager.GetAccount({accountAddress});

    if (!accountInfo) {
      dispatch(SetErrorMessage({message: "Invalid account: " + accountAddress}));
      return;
    }

    accountManager.RemoveAccount({accountAddress});

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

        const recipientInfo = accountManager.GetAccount({accountAddress: recipient});
        const recipientName = recipientInfo ? recipientInfo.accountName : recipient;

        dispatch(UpdateAccountBalance({
          client,
          accountAddress: client.CurrentAccountAddress()
        }));

        dispatch(SetNotificationMessage({
          message: "Successfully sent φ" + ether + " to " + recipientName,
          redirect: true
        }));
      }
    });
  };
};

// Failed to authenticate, save current location and show error message
export const AuthenticationFailure = ({message, originalLocation}) => {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.accounts.saveLocation,
      location: originalLocation
    });

    dispatch(SetErrorMessage({
      message,
      redirect: true
    }));
  };
};
