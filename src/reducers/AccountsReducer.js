import ActionTypes from "../actions/ActionTypes";
import {FormatAddress} from "../utils/Helpers";

const UpdateUserProfile = (state, accountAddress, newData={}) => {
  const userProfileState = state.userProfiles[accountAddress] || {};
  return {
    ...state,
    userProfiles: {
      ...state.userProfiles,
      [accountAddress]: {
        ...userProfileState,
        ...newData
      }
    }
  };
};

const AccountsReducer = (state = {}, action) => {
  // Ensure addresses are always in the same format
  if(action.accountAddress) { action.accountAddress = FormatAddress(action.accountAddress); }

  switch (action.type) {
    case ActionTypes.accounts.getProfileImage:
      return UpdateUserProfile(
        state,
        action.accountAddress,
        {profileImageUrl: action.profileImageUrl}
      );

    case ActionTypes.accounts.getPublicProfile:
      return UpdateUserProfile(
        state,
        action.accountAddress,
        {publicMetadata: action.publicMetadata || {}}
      );

    case ActionTypes.accounts.getPrivateProfile:
      return UpdateUserProfile(
        state,
        action.accountAddress,
        {privateMetadata: action.privateMetadata || {}}
      );

    case ActionTypes.accounts.setAccounts:
      return {
        ...state,
        activeAccounts: action.accounts,
        currentAccount: action.currentAccount
      };

    case ActionTypes.accounts.updateAccountBalance:
      // eslint-disable-next-line no-case-declarations
      const balance = action.balance ? `φ${Math.round(action.balance * 1000) / 1000}` : "";
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.accountAddress]: balance
        }
      };

    case ActionTypes.accounts.saveLocation:
      return {
        ...state,
        savedLocation: action.location
      };

    case ActionTypes.accounts.clearSavedLocation:
      return {
        ...state,
        savedLocation: undefined
      };

    default:
      return {
        ...state,
        balances: state.balances || {},
        activeAccounts: state.activeAccounts || [] || state.accountManager.Accounts(),
        currentAccount: state.currentAccount,
        savedLocation: state.savedLocation,
        userProfiles: state.userProfiles || {}
      };
  }
};

export default AccountsReducer;
