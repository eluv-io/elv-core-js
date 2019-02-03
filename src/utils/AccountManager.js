export const ELV_ACCOUNTS_KEY = "ElvAccounts";
export const ELV_CURRENT_ACCOUNT_KEY = "ElvCurrentAccount";

import Utils from "elv-client-js/src/Utils";

// Manage account information in localstorage and ElvWallet
class AccountManager {
  constructor({elvWallet}) {
    this.elvWallet = elvWallet;
  }

  Accounts() {
    const accounts = this.__StoredAccounts();

    // Insert signer into each account record
    // Signer storage (elvWallet) and and local storage are *only* merged here
    Object.keys(accounts).forEach(accountAddress => {
      accounts[accountAddress].signer = this.elvWallet.GetAccount({accountName: accountAddress});
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

    const accountAddress = Utils.FormatAddress(accountCredentials.signer.address);

    currentAccounts[accountAddress] = {
      accountName,
      accountAddress,
      encryptedPrivateKey: accountCredentials.encryptedPrivateKey
    };

    this.__UpdateAccounts(currentAccounts);

    this.elvWallet.AddAccount({
      accountName: accountAddress,
      privateKey: accountCredentials.signer.privateKey
    });

    return this.GetAccount({accountAddress});
  }

  GetAccount({accountAddress}) {
    return this.Accounts()[accountAddress];
  }

  async Authenticate({accountAddress, password}) {
    const account = this.GetAccount({accountAddress});
    if(!account) { throw Error("Unknown account: " + accountAddress); }
    const signer = await this.elvWallet.AddAccountFromEncryptedPK({
      accountName: accountAddress,
      encryptedPrivateKey: account.encryptedPrivateKey,
      password
    });

    if(!signer) { throw Error("Invalid credentials"); }

    // Get account again - will include signer
    return this.GetAccount({accountAddress});
  }

  SwitchAccount({accountAddress}) {
    if(accountAddress) {
      localStorage.setItem(ELV_CURRENT_ACCOUNT_KEY, accountAddress);
    } else {
      localStorage.removeItem(ELV_CURRENT_ACCOUNT_KEY);
    }
  }

  CurrentAccount() {
    return this.Accounts()[localStorage.getItem(ELV_CURRENT_ACCOUNT_KEY)];
  }

  RemoveAccount({accountAddress}) {
    let currentAccounts = this.__StoredAccounts();

    // Remove from localstorage
    delete currentAccounts[accountAddress];
    this.__UpdateAccounts(currentAccounts);

    // Remove from wallet
    this.elvWallet.RemoveAccount({accountAddress});
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

    if(!encryptedPrivateKey || (encryptedPrivateKey.Crypto || encryptedPrivateKey.crypto).kdfparams.n !== 16384) {
      // (re)encrypt key with low N for faster decryption
      const options = {
        scrypt: {N: 16384}
      };

      encryptedPrivateKey = await this.elvWallet.GenerateEncryptedPrivateKey({signer, password, options});
    }

    return {
      signer,
      encryptedPrivateKey
    };
  }
}

export default AccountManager;
