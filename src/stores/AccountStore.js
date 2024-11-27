import {flow, makeAutoObservable} from "mobx";
import UrlJoin from "url-join";
import {DownloadFromUrl} from "../utils/Utils";
import {Utils} from "@eluvio/elv-client-js";
import {v4 as UUID, parse as ParseUUID} from "uuid";

class AccountStore {
  oryClient;

  accounts = {};
  currentAccountAddress;
  currentOryAccountAddress;
  accountsLoaded = false;
  tenantAdmins = [];

  authenticating = false;
  loadingAccount;
  switchingAccounts = false;

  authNonce = localStorage.getItem("auth-nonce") || Utils.B58(ParseUUID(UUID()));

  get hasAccount() {
    return Object.keys(this.accounts).length > 0;
  }

  get isTenantAdmin() {
    return this.tenantAdmins.includes(this.currentAccountAddress);
  }

  get currentAccount() {
    return this.currentAccountAddress ? this.accounts[this.currentAccountAddress] : undefined;
  }

  get sortedAccounts() {
    return Object.keys(this.accounts)
      .map(address => this.accounts[address])
      .sort((a, b) => {
        if(a.lastSignedInAt || b.lastSignedInAt) {
          if(!a.lastSignedInAt) {
            return 1;
          } else if(!b.lastSignedInAt) {
            return -1;
          }

          return a.lastSignedInAt > b.lastSignedInAt ? -1 : 1;
        }

        return (a?.name?.toLowerCase() || "zz") < (b?.name?.toLowerCase() || "zz") ? -1 : 1;
      })
      .map(account => account.address);
  }

  get authToken() {
    const token = this.currentAccount.signingToken;

    if(token) {
      const { expiresAt } = Utils.FromB58ToStr(token);

      if(expiresAt < Date.now() - 6 * 24 * 60 * 1000) {
        this.currentAccount.authToken = undefined;
        this.currentAccount.signingToken = undefined;
      } else {
        return token;
      }
    }

    return undefined;
  }

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.network = (EluvioConfiguration["config-url"].match(/\.(net\d+)\./) || [])[1] || "";
    this.rootStore.coreUrl = EluvioConfiguration["coreUrl"] || "";

    this.Log = rootStore.Log;

    localStorage.setItem("auth-nonce", this.authNonce);

    this.InitializeOryClient();
  }

  InitializeOryClient = flow(function * () {
    const {Configuration, FrontendApi} = yield import("@ory/client");
    this.oryClient = new FrontendApi(
      new Configuration({
        features: {
          kratos_feature_flags_use_continue_with_transitions: true,
          use_continue_with_transitions: true
        },
        basePath: EluvioConfiguration.ory_configuration.url,
        // we always want to include the cookies in each request
        // cookies are used for sessions and CSRF protection
        baseOptions: {
          withCredentials: true
        }
      })
    );

    this.CurrentOryAccountAddress();
  });

  CurrentOryAccountAddress = flow(function * () {
    try {
      const response = yield this.oryClient.toSession({
        tokenizeAs: EluvioConfiguration.ory_configuration.jwt_template
      });

      const email = response.data.identity.traits.email;

      this.currentOryAccountAddress = Object.keys(this.accounts)
        .find(address => this.accounts[address] === email);
    } catch (error) {
      this.currentOryAccountAddress = undefined;
    }

    return this.currentOryAccountAddress;
  });

  AuthenticateOry = flow(function * ({userData, sendVerificationEmail, force=false}={}) {
    try {
      const response = yield this.oryClient.toSession({
        tokenizeAs: EluvioConfiguration.ory_configuration.jwt_template
      });

      const email = response.data.identity.traits.email;

      const tokens = yield this.rootStore.walletClient.AuthenticateOAuth({
        idToken: response.data.tokenized,
        email,
        tenantId: this.rootStore.eluvioTenantId,
        shareEmail: userData?.share_email,
        extraData: userData || {},
        nonce: this.authNonce,
        createRemoteToken: false,
        force
      });

      const address = this.rootStore.client.CurrentAccountAddress();

      this.accounts[address] = {
        ...(this.accounts[address] || {}),
        type: "custodial",
        email,
        name: email,
        address,
        signer: this.rootStore.client.signer,
        authToken: tokens.authToken,
        signingToken: tokens.signingToken,
        lastSignedInAt: Date.now()
      };

      yield this.SetCurrentAccount({signer: this.rootStore.client.signer});

      if(this.accounts[address].balance > 0.1) {
        yield this.ReplaceUserMetadata({
          metadataSubtree: UrlJoin("public", "name"),
          metadata: email
        });
      }

      this.SaveAccounts();

      if(sendVerificationEmail) {
        this.SendLoginEmail({email, type: "request_email_verification"});
      }
    } catch (error) {
      this.Log("Error logging in with Ory:", true);
      this.Log(error, true);

      if([400, 403, 503].includes(parseInt(error?.status))) {
        throw { login_limited: true };
      }
    }
  });

  LogOutOry = flow(function * () {
    try {
      const response = yield this.oryClient.createBrowserLogoutFlow();
      yield this.oryClient.updateLogoutFlow({token: response.data.logout_token});
    } catch (error) {
      this.Log(error, true);
    }

    this.currentOryAccountAddress = undefined;
  });

  // Auth
  SendLoginEmail = flow(function * ({email, type, code, callbackUrl}) {
    try {
      const result = yield this.rootStore.client.utils.ResponseToJson(
        this.rootStore.client.authClient.MakeAuthServiceRequest({
          path: UrlJoin("as", "wlt", type === "send_invite_email" ? "" : "ory", type),
          method: "POST",
          queryParams: code ? { code } : {},
          body: {
            tenant: this.rootStore.eluvioTenantId,
            email,
            callback_url: callbackUrl.toString()
          },
          headers: type === "reset_password" ?
            {} :
            { Authorization: `Bearer ${this.rootStore.walletClient.AuthToken()}` }
        })
      );

      /*
      if(type === "confirm_email") {
        this.SetAlertNotification(this.l10n.login.email_confirmed);
      }

       */

      return result;
    } catch (error) {
      this.Log(error, true);
    }
  });

  ResizeImage(imageUrl, height) {
    return client.utils.ResizeImage({
      imageUrl,
      height
    });
  }

  ExportAccounts() {
    const accounts = new Blob([this.SaveAccounts()], {type: "text/plain"});

    DownloadFromUrl(
      window.URL.createObjectURL(accounts),
      "EluvioAccounts.elv"
    );
  }

  ImportAccounts(accounts) {
    accounts = JSON.parse(this.rootStore.client.utils.FromB64(accounts));

    Object.keys(accounts).forEach(address => {
      const formattedAddress = this.rootStore.client.utils.FormatAddress(address);
      if(!this.accounts[formattedAddress]) {
        this.accounts[formattedAddress] = {
          ...accounts[address],
          metadata: {public: {}}
        };
      }
    });

    this.SaveAccounts();
  }

  LoadAccounts = flow(function * () {
    const tenantAdmins = localStorage.getItem(`elv-admins-${this.network}`);
    if(tenantAdmins) {
      try {
        this.tenantAdmins = JSON.parse(tenantAdmins);
      } catch (error) {
        this.Log("Unable to parse tenant admin list:", true);
        this.Log(error, true);
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

          accounts[address].type = accounts[address].type || "key";
        } catch (error) {
          this.Log("Error loading account " + address, true);
          this.Log(error, true);

          accounts[address].metadata = {
            public: {}
          };
        }
      })
    );

    this.accounts = accounts;

    Object.keys(accounts).map(account => this.AccountBalance(account));
    this.accountsLoaded = true;

    if(this.currentAccount?.signingToken) {
      this.authenticating = true;

      try {
        yield this.rootStore.walletClient.Authenticate({token: this.currentAccount.signingToken});
        yield this.SetCurrentAccount({signer: this.rootStore.client.signer});
      } catch (error) {
        this.Log("Failed to load custodial account", true);
        this.Log(error, true);

        this.currentAccount.signingToken = undefined;
        this.currentAccount.authToken = undefined;
        this.currentAccount.signer = undefined;

        this.SaveAccounts();
      }

      this.authenticating = false;
    }
  });

  AccountBalance = flow(function * (address) {
    try {
      const client = this.rootStore.client;

      address = client.utils.FormatAddress(address);

      const balance = client.utils.ToBigNumber(
        yield client.GetBalance({address})
      ).toFixed(3);

      if(Object.keys(this.accounts).includes(address)) {
        this.accounts[address].balance = balance;
        this.accounts[address].lowBalance = parseFloat(balance) < 0.1;
      }

      return balance;
    } catch (error) {
      this.Log(error, true);
    }
  });

  LockAccount = flow(function * ({address}) {
    if(!(Object.keys(this.accounts).includes(address))) {
      return;
    }

    this.accounts[address].signer = undefined;
    this.accounts[address].signingToken = undefined;
    this.accounts[address].authToken = undefined;

    if(Utils.EqualAddress(address, this.currentAccountAddress)) {
      this.currentAccountAddress = undefined;
      yield this.rootStore.InitializeClient();
    }

    if(this.oryClient) {
      yield this.LogOutOry();
    }
  });

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
    yield this.rootStore.tenantStore.LoadPublicTenantMetadata({tenantContractId: id});

    this.accounts[this.currentAccountAddress].tenantName =
      this.rootStore.tenantStore.tenantMetadata[id]?.public?.name || "";

    this.SaveAccounts();
  });

  SetCurrentAccount = flow(function * ({address, signer, switchAccount=false}) {
    try {
      if(switchAccount) {
        this.switchingAccounts = true;
      }

      address = this.rootStore.client.utils.FormatAddress(address || signer.address);

      let account = { ...this.accounts[address] } || {};

      this.rootStore.ResetTenancy();

      this.loadingAccount = address;

      signer = signer || account.signer;

      if(signer) {
        yield this.rootStore.InitializeClient(signer);

        if(yield this.rootStore.client.userProfileClient.WalletAddress()) {
          account.tenantContractId = yield this.rootStore.client.userProfileClient.TenantContractId();
        }
      }

      if(account.tenantContractId) {
        yield this.rootStore.tenantStore.LoadPublicTenantMetadata({
          tenantContractId: account.tenantContractId
        });

        account.tenantName =
          this.rootStore.tenantStore.tenantMetadata[account.tenantContractId]?.public?.name ||
          account.tenantName || "";
      }

      account.signer = signer;
      account.lastSignedInAt = Date.now();

      this.accounts[address] = account;

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

      this.SaveAccounts();
    } catch (error) {
      this.Log("Error loading account " + address, true);
      this.Log(error, true);
    } finally {
      this.switchingAccounts = false;
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
      type: "key",
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

    if(this.accounts[address].tenantContractId) {
      this.accounts[address].tenantName = this.rootStore.tenantStore.tenantMetadata[this.accounts[address].tenantContractId]?.public?.name || "";
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
      (yield this.rootStore.client.userProfileClient.UserMetadata({})) || {};

    if(!this.accounts[address].metadata.public) {
      this.accounts[address].metadata.public = {};
    }

    this.accounts[address].name = this.accounts[address].metadata.public.name || "";

    try {
      if(this.accounts[address].metadata.public.profile_image) {
        this.accounts[address].imageUrl = (yield this.ProfileImage({address}));
      }
    } catch (error) {
      this.Log("Error loading account image:", true);
      this.Log(error, true);
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

  // Update saved tenant name for accounts when tenant name changes
  UpdateTenantName({tenantContractId, name}) {
    if(!name) { return; }

    Object.keys(this.accounts).forEach(address => {
      if(this.accounts[address].tenantContractId === tenantContractId) {
        this.accounts[address].tenantName = name;
      }
    });

    this.SaveAccounts();
  }

  RemoveAccount = flow(function * (address) {
    delete this.accounts[address];

    this.SaveAccounts();

    if(this.currentAccountAddress === address) {
      this.currentAccountAddress = undefined;
      yield this.LogOutOry();
      yield this.rootStore.InitializeClient();
    }
  });

  SaveAccounts() {
    let savedAccounts = {};
    Object.values(this.accounts).forEach(account =>
      savedAccounts[account.address] = {
        email: account.email || "",
        type: account.type || "key",
        name: (account.name || account.email || "").toString(),
        imageUrl: account.imageUrl,
        address: account.address,
        encryptedPrivateKey: account.encryptedPrivateKey,
        tenantContractId: account.tenantContractId,
        tenantName: account.tenantName || this.rootStore.tenantStore.tenantMetadata[account.tenantContractId]?.public?.name || "",
        authToken: account.authToken,
        signingToken: account.signingToken,
        lastSignedInAt: account.lastSignedInAt
      }
    );

    localStorage.setItem(
      `elv-accounts-${this.network}`,
      btoa(JSON.stringify(savedAccounts))
    );

    return btoa(JSON.stringify(savedAccounts));
  }
}

export default AccountStore;

