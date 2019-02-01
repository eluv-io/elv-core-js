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
      const balance = action.balance ? `φ${Math.round(action.balance * 1000) / 1000}` : "";
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.accountAddress]: balance
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
