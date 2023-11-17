import {flow, makeAutoObservable} from "mobx";
import UrlJoin from "url-join";

class AccountStore {
  accounts = {};
  currentAccountAddress;
  accountsLoaded = false;
  tenantAdmins = [];

  loadingAccount;

  get isTenantAdmin() {
    return this.tenantAdmins.includes(this.currentAccountAddress);
  }

  get currentAccount() {
    return this.currentAccountAddress ? this.accounts[this.currentAccountAddress] : undefined;
  }

  get sortedAccounts() {
    return Object.keys(this.accounts)
      .map(address => [address, (this.accounts[address] || {}).name])
      .sort(([addressA, nameA], [addressB, nameB]) => {
        if(nameA && nameB) {
          return nameA.toLowerCase() < nameB.toLowerCase() ? -1 : 1;
        } else if(nameA) {
          return -1;
        } else if(nameB) {
          return 1;
        } else {
          return addressA.toLowerCase() < addressB.toLowerCase() ? -1 : 1;
        }
      })
      .map(([address]) => address);
  }

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.network = (EluvioConfiguration["config-url"].match(/\.(net\d+)\./) || [])[1] || "";
    this.rootStore.coreUrl = EluvioConfiguration["coreUrl"] || "";
  }

  ResizeImage(imageUrl, height) {
    return client.utils.ResizeImage({
      imageUrl,
      height
    });
  }

  LoadAccounts = flow(function * () {
    const tenantAdmins = localStorage.getItem(`elv-admins-${this.network}`);
    if(tenantAdmins) {
      try {
        this.tenantAdmins = JSON.parse(tenantAdmins);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Unable to parse tenant admin list:");
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    let accounts = localStorage.getItem(`elv-accounts-${this.network}`) || localStorage.getItem("elv-accounts");
    accounts = accounts ? JSON.parse(atob(accounts)) : {};

    this.currentAccountAddress = localStorage.getItem(`elv-current-account-${this.network}`) || localStorage.getItem("elv-current-account");

    yield Promise.all(
      Object.keys(accounts).map(async address => {
        try {
          if(!accounts[address].name && this.rootStore.client.fabricVersion <= 2) {
            accounts[address].metadata = {
              public: (await this.rootStore.client.userProfileClient.PublicUserMetadata({address})) || {}
            };

            accounts[address].name = accounts[address].metadata.public.name;
          } else {
            accounts[address].metadata = {
              public: {}
            };
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error loading account " + address);
          // eslint-disable-next-line no-console
          console.error(error);

          accounts[address].metadata = {
            public: {}
          };
        }
      })
    );

    this.accounts = accounts;

    Object.keys(accounts).map(account => this.AccountBalance(account));

    this.accountsLoaded = true;
  });

  AccountBalance = flow(function * (address) {
    const client = this.rootStore.client;

    address = client.utils.FormatAddress(address);

    const balance = client.utils.ToBigNumber(
      yield client.GetBalance({address})
    ).toFixed(3);

    if(Object.keys(this.accounts).includes(address)) {
      this.accounts[address].balance = balance;
    }

    return balance;
  });

  LockAccount({address}) {
    if(!(Object.keys(this.accounts).includes(address))) {
      return;
    }

    this.accounts[address].signer = undefined;
  }

  UnlockAccount = flow(function * ({address, password}) {
    const client = this.rootStore.client;
    address = client.utils.FormatAddress(address);

    const account = this.accounts[address];

    if(!account) { throw Error(`Unknown account: ${address}`); }

    if(!account.signer) {
      const wallet = client.GenerateWallet();
      this.accounts[address].signer = yield wallet.AddAccountFromEncryptedPK({
        encryptedPrivateKey: account.encryptedPrivateKey,
        password
      });
    }

    this.rootStore.InitializeClient(this.accounts[address].signer);

    yield this.SetCurrentAccount({signer: this.accounts[address].signer});
  });

  SendFunds = flow(function * ({recipient, ether}) {
    recipient = this.rootStore.client.utils.FormatAddress(recipient);

    yield this.rootStore.client.SendFunds({recipient, ether});
    yield this.AccountBalance(this.currentAccountAddress);
    yield this.AccountBalance(recipient);
  });

  GenerateMnemonic() {
    const wallet = this.rootStore.client.GenerateWallet();
    return wallet.GenerateMnemonic();
  }

  SetTenantContractId = flow(function * ({id}) {
    id = id.trim();

    yield this.rootStore.client.userProfileClient.SetTenantContractId({tenantContractId: id});
    this.accounts[this.currentAccountAddress].tenantContractId = yield this.rootStore.client.userProfileClient.TenantContractId();
    yield this.UserMetadata();

    this.SaveAccounts();
  });

  SetCurrentAccount = flow(function * ({address, signer}) {
    try {
      this.rootStore.ResetTenancy();

      address = this.rootStore.client.utils.FormatAddress(address || signer.address);

      this.loadingAccount = address;

      signer = signer || this.accounts[address].signer;

      if(signer) {
        yield this.rootStore.InitializeClient(signer);
      }

      this.accounts[address].signer = signer;

      yield this.AccountBalance(address);

      this.currentAccountAddress = address;

      localStorage.setItem(
        `elv-current-account-${this.network}`,
        address.toString()
      );

      if(signer && this.accounts[address].balance > 0.1) {
        this.UserMetadata();
        this.CheckTenantDetails();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading account", address);
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loadingAccount = undefined;
    }
  });

  AddAccount = flow(function * ({
    privateKey,
    encryptedPrivateKey,
    mnemonic,
    password,
    passwordConfirmation,
    name,
    inviteId,
    adminAddress,
    faucetToken,
    tenantContractId
  }) {
    if(password !== passwordConfirmation) {
      throw Error("Password and confirmation do not match");
    }

    const client = this.rootStore.client;
    const wallet = client.GenerateWallet();

    let signer;
    if(mnemonic) {
      signer = wallet.AddAccountFromMnemonic({mnemonic});
    } else if(encryptedPrivateKey) {
      signer = yield wallet.AddAccountFromEncryptedPK({encryptedPrivateKey, password});
    } else {
      signer = wallet.AddAccount({privateKey: privateKey.trim()});
    }

    if(!this.rootStore.simplePasswords) {
      const passwordTests = [
        [{test: str => str.length >= 6}, "must be at least 6 characters"],
        [/[a-z]/, "must contain at least one lowercase character"],
        [/[A-Z]/, "must contain at least one uppercase character"],
        [/[0-9]/, "must contain at least one number"],
        [/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/, "must contain at least one symbol"]
      ];

      let failedTest = passwordTests.find(([test]) => !test.test(password));
      if(failedTest) {
        throw Error(`Password ${failedTest[1]}`);
      }
    }

    encryptedPrivateKey = yield wallet.GenerateEncryptedPrivateKey({
      signer,
      password,
      options: {scrypt: {N: 16384}}
    });

    const address = client.utils.FormatAddress(signer.address);

    this.accounts[address] = {
      address,
      signer,
      encryptedPrivateKey
    };

    if(inviteId) {
      yield this.rootStore.tenantStore.ConsumeInvite({
        tenantContractId,
        name,
        address,
        inviteId,
        adminAddress,
        faucetToken
      });
    }

    yield this.SetCurrentAccount({signer});

    if(name) {
      yield this.ReplaceUserMetadata({
        metadataSubtree: UrlJoin("public", "name"),
        metadata: name
      });
    }

    if(tenantContractId) {
      yield this.SetTenantContractId({
        id: tenantContractId
      });
    }

    this.SaveAccounts();
  });

  CheckTenantDetails = flow(function * () {
    const tenantContractId = yield this.rootStore.client.userProfileClient.TenantContractId();
    if(tenantContractId) {
      this.accounts[this.currentAccountAddress].tenantContractId = tenantContractId;
      const tenantAdminGroupAddress = yield this.rootStore.client.CallContractMethod({
        contractAddress: this.rootStore.client.utils.HashToAddress(tenantContractId),
        methodName: "groupsMapping",
        methodArgs: ["tenant_admin", 0],
        formatArguments: true,
      });
      const accountGroups = yield this.rootStore.client.Collection({collectionType: "accessGroups"});

      const isTenantAdmin = !!accountGroups?.find(address => this.rootStore.client.utils.EqualAddress(tenantAdminGroupAddress, address));

      if(isTenantAdmin) {
        if(!this.tenantAdmins.includes(this.currentAccountAddress)) {
          this.tenantAdmins = [...this.tenantAdmins, this.currentAccountAddress];
        }
      } else {
        this.tenantAdmins = this.tenantAdmins.filter(address => !this.rootStore.client.utils.EqualAddress(this.currentAccountAddress, address));
      }

      localStorage.setItem(`elv-admins-${this.network}`, JSON.stringify(this.tenantAdmins));
    }
  });

  /* Profile */

  async ProfileImage({address}) {
    return await this.rootStore.client.userProfileClient.UserProfileImage({address});
  }

  UserMetadata = flow(function * () {
    if(!this.currentAccountAddress) { return; }

    const address = this.currentAccountAddress;

    this.accounts[address].metadata =
      (yield this.rootStore.client.userProfileClient.UserMetadata()) || {};

    if(!this.accounts[address].metadata.public) {
      this.accounts[address].metadata.public = {};
    }

    this.accounts[address].name = this.accounts[address].metadata.public.name || "";

    try {
      if(this.accounts[address].metadata.public.profile_image) {
        this.accounts[address].imageUrl = (yield this.ProfileImage({address}));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading account image:");
      // eslint-disable-next-line no-console
      console.error(error);
    }

    yield this.AccountBalance(address);

    this.SaveAccounts();
  });

  ReplaceUserProfileImage = flow(function * (image) {
    if(!this.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.SetUserProfileImage({image});

    yield this.UserMetadata();

    const address = this.currentAccountAddress;

    this.accounts[address].imageUrl =
      (yield this.rootStore.client.userProfileClient.UserProfileImage({address}))
      + `&cache=${Math.random()}` ;
  });

  ReplaceUserMetadata = flow(function * ({metadataSubtree, metadata}) {
    if(!this.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.ReplaceUserMetadata({metadataSubtree, metadata});

    yield this.UserMetadata();
  });

  DeleteUserMetadata = flow(function * ({metadataSubtree}) {
    if(!this.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.DeleteUserMetadata({metadataSubtree});

    yield this.UserMetadata();
  });

  RemoveAccount(address) {
    if(!(Object.keys(this.accounts).includes(address))) {
      return;
    }

    if(this.currentAccountAddress === address) {
      this.rootStore.InitializeClient();
      this.currentAccountAddress = undefined;
    }

    delete this.accounts[address];

    this.SaveAccounts();
  }

  SaveAccounts() {
    let savedAccounts = {};
    Object.values(this.accounts).forEach(account =>
      savedAccounts[account.address] = {
        name: (account.name || "").toString(),
        imageUrl: account.image,
        address: account.address,
        encryptedPrivateKey: account.encryptedPrivateKey,
        tenantContractId: account.tenantContractId
      }
    );

    localStorage.setItem(
      `elv-accounts-${this.network}`,
      btoa(JSON.stringify(savedAccounts))
    );
  }
}

export default AccountStore;

