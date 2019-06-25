export const GetAccountBalance = async ({context, address}) => {
  const balance = context.client.utils.ToBigNumber(
    await context.client.GetBalance({address})
  ).toFixed(3);

  await context.MergeContext("accounts", address, {balance});
};

const SetCurrentAccount = async ({context, signer, address}) => {
  address = context.client.utils.FormatAddress(address);

  signer ? context.client.SetSigner({signer}) : context.client.ClearSigner();

  await context.UpdateContext({currentAccount: address});

  localStorage.setItem(
    "elv-current-account",
    address
  );
};

const UpdateAccounts = async ({context, accounts, currentAccount}) => {
  // Update account balances
  Object.keys(accounts).forEach(address => GetAccountBalance({context, address}));

  const signer = accounts[currentAccount] && accounts[currentAccount].signer;
  await SetCurrentAccount({context, signer, address: currentAccount});

  // Update app context
  await context.UpdateContext({accounts});

  // Save address and encrypted private key to localstorage
  let savedAccounts = {};
  Object.values(accounts).forEach(account =>
    savedAccounts[account.address] = {
      address: account.address,
      encryptedPrivateKey: account.encryptedPrivateKey
    }
  );

  localStorage.setItem(
    "elv-accounts",
    btoa(JSON.stringify(savedAccounts))
  );
};

export const AddAccount = async ({context, privateKey, password}) => {
  const wallet = context.client.GenerateWallet();
  const signer = wallet.AddAccount({privateKey});
  const encryptedPrivateKey = await wallet.GenerateEncryptedPrivateKey({
    signer,
    password,
    options: {scrypt: {N: 16384}}
  });

  const address = context.client.utils.FormatAddress(signer.address);

  const updatedAccounts = {
    ...context.accounts,
    [address]: {
      address,
      signer,
      encryptedPrivateKey,
      profile: {}
    }
  };

  await UpdateAccounts({context, accounts: updatedAccounts, currentAccount: address});
};

export const RemoveAccount = ({context, address}) => {
  address = context.client.utils.FormatAddress(address);

  let updatedAccounts = {
    ...context.accounts,
  };

  delete updatedAccounts[address];

  const currentAccount = context.currentAccount === address ? undefined : context.currentAccount;
  UpdateAccounts({context, accounts: updatedAccounts, currentAccount});
};

export const UnlockAccount = async ({context, address, password}) => {
  address = context.client.utils.FormatAddress(address);

  const account = context.accounts[address];

  if(!account) { throw Error(`Unknown account: ${address}`); }

  if(!account.signer) {
    const wallet = context.client.GenerateWallet();
    account.signer = await wallet.AddAccountFromEncryptedPK({encryptedPrivateKey: account.encryptedPrivateKey, password});
  }

  let updatedAccounts = {
    ...context.accounts,
    [address]: account
  };

  await UpdateAccounts({context, accounts: updatedAccounts, currentAccount: address});
};

export const SendFunds = async ({context, recipient, ether}) => {
  await context.client.SendFunds({recipient, ether});
  await GetAccountBalance({context, address: context.currentAccount});
};
