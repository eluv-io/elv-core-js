export const ELV_ACCOUNTS_KEY = "ElvAccounts";
export const ELV_CURRENT_ACCOUNT_KEY = "ElvCurrentAccount";

// Manage account information in localstorage and ElvWallet
class AccountManager {
  constructor({elvWallet}) {
    this.elvWallet = elvWallet;
  }

  Accounts() {
    const accounts = this.__StoredAccounts();

    // Insert signer into each account record
    // Signer storage (elvWallet) and and local storage are *only* merged here
    Object.keys(accounts).forEach(accountName => {
      accounts[accountName].signer = this.elvWallet.GetAccount({accountName});
    });

    return accounts;
  }

  async AddAccount({accountName, encryptedPrivateKey, privateKey, mnemonic, password}) {
    const accountCredentials = await this.__CredentialsToSigner({
      encryptedPrivateKey,
      privateKey,
      mnemonic,
      password
    });

    if(!accountCredentials.signer) { throw Error("Invalid credentials"); }

    let currentAccounts = this.__StoredAccounts();

    currentAccounts[accountName] = {
      accountName,
      accountAddress: accountCredentials.signer.address.toLowerCase(),
      encryptedPrivateKey: accountCredentials.encryptedPrivateKey
    };

    this.__UpdateAccounts(currentAccounts);

    this.elvWallet.AddAccount({
      accountName,
      privateKey: accountCredentials.signer.privateKey
    });

    return this.GetAccount({accountName});
  }

  GetAccount({accountName}) {
    return this.Accounts()[accountName];
  }

  GetAccountByAddress({accountAddress}) {
    return Object.values(this.Accounts()).find(accountInfo =>
      accountInfo.accountAddress.toLowerCase() === accountAddress.toLowerCase());
  }

  async Authenticate({accountName, password}) {
    const account = this.GetAccount({accountName});
    if(!account) { throw Error("Unknown account: " + accountName); }
    const signer = await this.elvWallet.AddAccountFromEncryptedPK({
      accountName,
      encryptedPrivateKey: account.encryptedPrivateKey,
      password
    });

    if(!signer) { throw Error("Invalid credentials"); }

    // Get account again - will include signer
    return this.GetAccount({accountName});
  }

  SwitchAccount({accountName}) {
    if(accountName) {
      localStorage.setItem(ELV_CURRENT_ACCOUNT_KEY, accountName);
    } else {
      localStorage.removeItem(ELV_CURRENT_ACCOUNT_KEY);
    }
  }

  CurrentAccount() {
    return this.Accounts()[localStorage.getItem(ELV_CURRENT_ACCOUNT_KEY)];
  }

  RemoveAccount({accountName}) {
    let currentAccounts = this.__StoredAccounts();

    // Remove from localstorage
    delete currentAccounts[accountName];
    this.__UpdateAccounts(currentAccounts);

    // Remove from wallet
    this.elvWallet.RemoveAccount({accountName});
  }

  // Store accounts from localstorage
  __StoredAccounts() {
    const storedAccounts = localStorage.getItem(ELV_ACCOUNTS_KEY);

    if(storedAccounts === null) { return {}; }

    return JSON.parse(atob(storedAccounts));
  }

  // Update accounts in localstorage
  __UpdateAccounts(accounts) {
    localStorage.setItem(
      ELV_ACCOUNTS_KEY,
      btoa(
        JSON.stringify(
          accounts
        )
      )
    );
  }

  async __CredentialsToSigner({
    privateKey,
    encryptedPrivateKey,
    mnemonic,
    password,
  }) {
    let signer;

    if(privateKey) {
      signer = this.elvWallet.AddAccount({privateKey});
    } else if(mnemonic) {
      signer = this.elvWallet.AddAccountFromMnemonic({mnemonic});
    } else {
      signer = await this.elvWallet.AddAccountFromEncryptedPK({encryptedPrivateKey, password});
    }

    if(!encryptedPrivateKey) {
      encryptedPrivateKey = await this.elvWallet.GenerateEncryptedPrivateKey({signer, password});
    }

    return {
      signer,
      encryptedPrivateKey
    };
  }
}

export default AccountManager;
