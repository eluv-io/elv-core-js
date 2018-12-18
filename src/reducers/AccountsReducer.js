import ActionTypes from "../actions/ActionTypes";

const AccountsReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.accounts.setAccounts:
      return {
        ...state,
        activeAccounts: action.accounts,
        currentAccount: action.currentAccount
      };

    case ActionTypes.accounts.updateAccountBalance:
      const balance = action.balance ? `${Math.round(action.balance * 1000) / 1000} Eluvio Bux` : "";
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.accountName]: balance
        }
      };

    default:
      return {
        ...state,
        balances: state.balances || {},
        activeAccounts: state.activeAccounts || [] || state.accountManager.Accounts(),
        currentAccount: state.currentAccount
      };
  }
};

export default AccountsReducer;
