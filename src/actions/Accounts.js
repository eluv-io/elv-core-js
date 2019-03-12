import ActionTypes from "./ActionTypes";
import { SetErrorMessage, SetNotificationMessage } from "./Notifications";
import {ethers} from "ethers";
import {ElvClient} from "elv-client-js/src/ElvClient";

export const GetProfileImage = ({client, accountAddress}) => {
  return async (dispatch) => {
    accountAddress = client.utils.FormatAddress(accountAddress);

    const profileImageUrl = await client.userProfile.UserProfileImage({accountAddress});

    dispatch({
      type: ActionTypes.accounts.getProfileImage,
      accountAddress: accountAddress,
      profileImageUrl
    });
  };
};

export const GetPublicUserProfile = ({client, accountAddress}) => {
  return async (dispatch) => {
    accountAddress = client.utils.FormatAddress(accountAddress);

    const publicMetadata = await client.userProfile.PublicUserMetadata({accountAddress});

    dispatch({
      type: ActionTypes.accounts.getPublicProfile,
      accountAddress: accountAddress,
      publicMetadata,
    });
  };
};

export const GetPrivateUserProfile = ({client}) => {
  return async (dispatch) => {
    const privateMetadata = await client.userProfile.PrivateUserMetadata({});

    dispatch({
      type: ActionTypes.accounts.getPrivateProfile,
      accountAddress: client.utils.FormatAddress(client.signer.address),
      privateMetadata
    });
  };
};

export const SetProfileImage = ({client, image}) => {
  return async (dispatch) => {
    await client.userProfile.SetUserProfileImage({image});

    dispatch(SetNotificationMessage({
      message: "Successfully updated profile picture"
    }));
  };
};

export const UpdatePublicProfileMetadata = ({client, metadataSubtree="/", metadata}) => {
  return async (dispatch) => {
    await client.userProfile.ReplacePublicUserMetadata({metadataSubtree, metadata});

    dispatch(SetNotificationMessage({
      message: "Successfully updated profile information"
    }));
  };
};

export const UpdatePrivateProfileMetadata = ({client, metadataSubtree="/", metadata}) => {
  return async (dispatch) => {
    await client.userProfile.ReplacePrivateUserMetadata({metadataSubtree, metadata});

    dispatch(SetNotificationMessage({
      message: "Successfully updated profile information"
    }));
  };
};

export const DeletePrivateProfileMetadata = ({client, metadataSubtree="/"}) => {
  return async (dispatch) => {
    await client.userProfile.DeletePrivateUserMetadata({metadataSubtree});

    dispatch(SetNotificationMessage({
      message: "Successfully updated profile information"
    }));
  };
};

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
  return async (dispatch) => {
    const account = await accountManager.Authenticate({accountAddress, password});

    dispatch(SwitchAccount({client, account, accountManager}));
  };
};

const InitializeAccount = async (account) => {
  const accountClient = ElvClient.FromConfiguration({configuration: require("../../configuration.json")});
  accountClient.SetSigner({signer: account.signer});

  // TODO: Temporary
  // New account has no funds, give it some
  const testSigner = accountClient.GenerateWallet().AddAccount({privateKey: "0xca3a2b0329b2ed1ce491643917f4b13d1619088f73a03728bb4149ed3fda3fbf"});
  const balance = await testSigner.provider.getBalance(account.accountAddress);
  if(balance.eq(0)) {
    const sendTransaction = await testSigner.sendTransaction({
      to: account.accountAddress,
      value: ethers.utils.parseEther("10")
    });

    await sendTransaction.wait();
  }

  // Create library if not yet created
  await accountClient.userProfile.CreateAccountLibrary({});
  await accountClient.userProfile.ReplacePublicUserMetadata({metadataSubtree: "name", metadata: account.accountName});
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
  return async (dispatch) => {
    const account = await accountManager.AddAccount({
      accountName,
      privateKey,
      encryptedPrivateKey,
      mnemonic,
      password
    });

    await InitializeAccount(account);


    dispatch(SwitchAccount({client, account, accountManager}));
    dispatch(SetAccounts({client, accountManager}));

    dispatch(SetNotificationMessage({
      message: "Successfully added new account",
      redirect: true
    }));
  };
};

export const SwitchAccount = ({client, accountManager, account}) => {
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
  return async (dispatch) => {
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
  };
};

// Failed to authenticate, save current location and show error message
export const AuthenticationFailure = ({message, originalLocation}) => {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.accounts.saveLocation,
      location: originalLocation
    });

    if(message) {
      dispatch(SetErrorMessage({
        message,
        redirect: true
      }));
    }
  };
};
