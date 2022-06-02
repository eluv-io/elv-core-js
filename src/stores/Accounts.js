import { action, computed, flow, observable } from "mobx";
import { Buffer } from "buffer";

class AccountStore {
  @observable accounts = {};
  @observable currentAccountAddress;
  @observable accountsLoaded = false;

  @observable loadingAccount;

  @computed get currentAccount() {
    return this.currentAccountAddress
      ? this.accounts[this.currentAccountAddress]
      : undefined;
  }

  @computed get sortedAccounts() {
    return Object.keys(this.accounts)
      .map((address) => [address, (this.accounts[address] || {}).name])
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
    this.rootStore = rootStore;

    this.network =
      (EluvioConfiguration["config-url"].match(/\.(net\d+)\./) || [])[1] || "";
  }

  ResizeImage(imageUrl, height) {
    return client.utils.ResizeImage({
      imageUrl,
      height,
    });
  }

  @action.bound
  LoadAccounts = flow(function* () {
    let accounts = localStorage.getItem(`elv-accounts-${this.network}`) || localStorage.getItem("elv-accounts");
    accounts = accounts ? JSON.parse(atob(accounts)) : {};

    this.currentAccountAddress = localStorage.getItem(`elv-current-account-${this.network}`) || localStorage.getItem("elv-current-account");

    if(typeof window.ethereum !== "undefined") {
      if(ethereum.isConnected()) {
        yield ethereum.request({ method: "eth_accounts" }).then(
          action("fetchSuccess", (_accounts) => {
            if(_accounts.length) {
              accounts[_accounts[0]] = { name: "", address: _accounts[0], isMetaAccount: true };
              this.currentAccountAddress=_accounts[0];
            }
          })
        );
      }
    }

    yield Promise.all(
      Object.keys(accounts).map(async (address) => {
        try {
          if(
            !accounts[address].name &&
            this.rootStore.client.fabricVersion <= 2
          ) {
            accounts[address].metadata = {
              public:
                (await this.rootStore.client.userProfileClient.PublicUserMetadata(
                  { address }
                )) || {},
            };

            accounts[address].name = accounts[address].metadata.public.name;
          } else {
            accounts[address].metadata = {
              public: {},
            };
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error loading account " + address);
          // eslint-disable-next-line no-console
          console.error(error);

          accounts[address].metadata = {
            public: {},
          };
        }
      })
    );

    // meta mask integration start here
    this.accounts = accounts;

    Object.keys(accounts).map(this.AccountBalance);

    this.accountsLoaded = true;
  });

  @action.bound
  LoadMetaAccounts = flow(function* () {
    if(typeof window.ethereum !== "undefined") {
      if(ethereum.isConnected()) {
        yield ethereum.request({ method: "eth_accounts" }).then(
          action("fetchSuccess", (_accounts) => {
            if(_accounts.length) {
              this.accounts[_accounts[0]] = { name: "", address: _accounts[0] };
              this.SetCurrentAccount({ address: _accounts[0] });
            }
          })
        );
      }
    }
  });

  @action.bound
  AccountBalance = flow(function* (address) {
    const client = this.rootStore.client;

    address = client.utils.FormatAddress(address);

    if(!Object.keys(this.accounts).includes(address)) {
      return;
    }

    this.accounts[address].balance = client.utils
      .ToBigNumber(yield client.GetBalance({ address }))
      .toFixed(3);
  });

  @action.bound
  LockAccount({ address }) {
    if(!Object.keys(this.accounts).includes(address)) {
      return;
    }

    this.accounts[address].signer = undefined;
  }

  @action.bound
  UnlockAccount = flow(function* ({ address, password }) {
    const client = this.rootStore.client;
    address = client.utils.FormatAddress(address);
    const account = this.accounts[address];
    if(!account) {
      throw Error(`Unknown account: ${address}`);
    }
    if(!account.signer) {
      const wallet = client.GenerateWallet();
      this.accounts[address].signer = yield wallet.AddAccountFromEncryptedPK({
        encryptedPrivateKey: account.encryptedPrivateKey,
        password,
      });
    }
    this.rootStore.InitializeClient(this.accounts[address].signer);
    yield this.SetCurrentAccount({ signer: this.accounts[address].signer });
  });

  SendFunds = flow(function* ({ recipient, ether }) {
    recipient = this.rootStore.client.utils.FormatAddress(recipient);

    yield this.rootStore.client.SendFunds({ recipient, ether });
    yield this.AccountBalance(this.currentAccountAddress);
    yield this.AccountBalance(recipient);
  });

  GenerateMnemonic() {
    const wallet = this.rootStore.client.GenerateWallet();
    return wallet.GenerateMnemonic();
  }

  @action.bound
  SetTenantId = flow(function* ({ id }) {
    id = id.trim();

    yield this.rootStore.client.userProfileClient.SetTenantId({ id });
    this.accounts[this.currentAccountAddress].tenantId =
      yield this.rootStore.client.userProfileClient.TenantId();
  });

  // current account will come from meta mask
  @action.bound
  SetCurrentAccount = flow(function* ({ address, signer }) {
    try {
      address = this.rootStore.client.utils.FormatAddress(
        address || signer.address
      );
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
        this.accounts[address].tenantId =
          yield this.rootStore.client.userProfileClient.TenantId();
        this.UserMetadata();
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

  @action.bound
  AddAccount = flow(function* ({
    privateKey,
    encryptedPrivateKey,
    mnemonic,
    password,
    passwordConfirmation,
  }) {
    if(password !== passwordConfirmation) {
      throw Error("Password and confirmation do not match");
    }
    const client = this.rootStore.client;
    const wallet = client.GenerateWallet();
    let signer;
    if(mnemonic) {
      signer = wallet.AddAccountFromMnemonic({ mnemonic });
    } else if(encryptedPrivateKey) {
      signer = yield wallet.AddAccountFromEncryptedPK({
        encryptedPrivateKey,
        password,
      });
    } else {
      signer = wallet.AddAccount({ privateKey: privateKey.trim() });
    }
    if(!this.rootStore.simplePasswords) {
      const passwordTests = [
        [{ test: (str) => str.length >= 6 }, "must be at least 6 characters"],
        [/[a-z]/, "must contain at least one lowercase character"],
        [/[A-Z]/, "must contain at least one uppercase character"],
        [/[0-9]/, "must contain at least one number"],
        [
          /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
          "must contain at least one symbol",
        ],
      ];
      let failedTest = passwordTests.find(([test]) => !test.test(password));
      if(failedTest) {
        throw Error(`Password ${failedTest[1]}`);
      }
    }
    encryptedPrivateKey = yield wallet.GenerateEncryptedPrivateKey({
      signer,
      password,
      options: { scrypt: { N: 16384 } },
    });
    const address = client.utils.FormatAddress(signer.address);
    this.accounts[address] = {
      address,
      signer,
      encryptedPrivateKey,
    };
    yield this.SetCurrentAccount({ signer });
    this.SaveAccounts();
  });

  /* Profile */

  @action.bound
  UserMetadata = flow(function* () {
    if(!this.currentAccountAddress) {
      return;
    }

    const address = this.currentAccountAddress;

    this.accounts[address].metadata =
      (yield this.rootStore.client.userProfileClient.UserMetadata()) || {};

    if(!this.accounts[address].metadata.public) {
      this.accounts[address].metadata.public = {};
    }

    this.accounts[address].name =
      this.accounts[address].metadata.public.name || "";

    try {
      if(this.accounts[address].metadata.public.profile_image) {
        this.accounts[address].imageUrl =
          yield this.rootStore.client.userProfileClient.UserProfileImage({
            address,
          });
        this.accounts[address].image =
          "data:image/png;base64," +
          Buffer.from(
            yield client.Request({
              url: this.ResizeImage(this.accounts[address].imageUrl, 200),
              format: "arrayBuffer",
            })
          ).toString("base64");
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

  @action.bound
  ReplaceUserProfileImage = flow(function* (image) {
    if(!this.currentAccountAddress) {
      return;
    }

    yield this.rootStore.client.userProfileClient.SetUserProfileImage({
      image,
    });

    yield this.UserMetadata();

    const address = this.currentAccountAddress;

    this.accounts[address].imageUrl =
      (yield this.rootStore.client.userProfileClient.UserProfileImage({
        address,
      })) + `&cache=${Math.random()}`;
  });

  @action.bound
  ReplaceUserMetadata = flow(function* ({ metadataSubtree, metadata }) {
    if(!this.currentAccountAddress) {
      return;
    }

    yield this.rootStore.client.userProfileClient.ReplaceUserMetadata({
      metadataSubtree,
      metadata,
    });

    yield this.UserMetadata();
  });

  @action.bound
  DeleteUserMetadata = flow(function* ({ metadataSubtree }) {
    if(!this.currentAccountAddress) {
      return;
    }

    yield this.rootStore.client.userProfileClient.DeleteUserMetadata({
      metadataSubtree,
    });

    yield this.UserMetadata();
  });

  @action.bound
  SetCurrentTenant = flow(function* ({ id }) {
    yield this.rootStore.client.userProfileClient.SetTenantId({ id });
  });

  // this function will get removed
  @action.bound
  RemoveAccount(address) {
    if(!Object.keys(this.accounts).includes(address)) {
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
    Object.values(this.accounts).forEach(
      (account) =>
        (savedAccounts[account.address] = {
          name: (account.name || "").toString(),
          imageUrl: account.image,
          address: account.address,
          encryptedPrivateKey: account.encryptedPrivateKey,
        })
    );

    localStorage.setItem(
      `elv-accounts-${this.network}`,
      btoa(JSON.stringify(savedAccounts))
    );
  }
}

export default AccountStore;
