export const GetAccountBalance = async ({context, address}) => {
  const balance = "Φ" + context.client.utils.ToBigNumber(
    await context.client.GetBalance({address})
  ).toFixed(3);

  await context.MergeContext("accounts", address, {balance});
};

const SetCurrentAccount = async (context, signer, address) => {
  const client = context.client;
  client.SetSigner({signer});

  address = client.utils.FormatAddress(address);

  await context.UpdateContext({
    signer,
    currentAccount: address
  });

  localStorage.setItem(
    "elv-current-account",
    address
  );
};

const UpdateAccounts = async (context, accounts) => {
  let formattedAccounts = {};

  // Ensure all accounts have properly formatted addresses
  Object.keys(accounts).forEach(address => {
    const formattedAddress = context.client.utils.FormatAddress(address);

    formattedAccounts[formattedAddress] = accounts[address];

    // If existing account format is incorrect, update the contained address and delete the old key
    if(formattedAddress !== address) {
      formattedAccounts[formattedAddress] = {
        address: formattedAddress
      };

      delete accounts[address];
    }
  });

  // Update account balances
  Object.keys(accounts).forEach(address => GetAccountBalance({context, address}));

  // Update app context
  await context.UpdateContext({accounts: formattedAccounts});

  // Save address and encrypted private key to localstorage
  let savedAccounts = {};
  Object.values(formattedAccounts).forEach(account =>
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
      encryptedPrivateKey
    }
  };

  await UpdateAccounts(context, updatedAccounts);
  await SetCurrentAccount(context, signer, address);
};

export const RemoveAccount = ({context, address}) => {
  address = context.client.utils.FormatAddress(address);

  let updatedAccounts = {
    ...context.accounts,
  };

  delete updatedAccounts[address];

  UpdateAccounts(context, updatedAccounts);
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

  await UpdateAccounts(context, updatedAccounts);
  await SetCurrentAccount(context, account.signer, address);
};

export const SendFunds = async ({context, recipient, ether}) => {
  await context.client.SendFunds({recipient, ether});
  await GetAccountBalance({context, address: context.currentAccount});
};
