const ActionTypes = {
  accounts: {
    setAccounts: "UPDATE_ACCOUNTS",
    updateAccountBalance: "UPDATE_ACCOUNT_BALANCE"
  },
  client: {
    clearSigner: "CLEAR_SIGNER",
    setSigner: "SET_SIGNER"
  },
  notifications: {
    error: {
      set: "SET_ERROR_MESSAGE",
    },
    notification: {
      set: "SET_NOTIFICATION_MESSAGE"
    },
    clear: "CLEAR_NOTIFICATIONS"
  },
  requests: {
    submitted: "REQUEST_SUBMITTED",
    completed: "REQUEST_COMPLETED",
    error: "REQUEST_ERROR"
  }
};

export default ActionTypes;
