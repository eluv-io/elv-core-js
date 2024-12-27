import {configure, flow, makeAutoObservable} from "mobx";
import {ElvClient, ElvWalletClient, Utils} from "@eluvio/elv-client-js";
import AccountStore from "./AccountStore";
import TenantStore from "./TenantStore";
import LocalizationEN from "../static/localizations/en.yml";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  networkName;
  configError = false;
  walletClient;
  client;
  searchClient;
  signerSet = false;
  simplePasswords = false;
  utils = Utils;
  activeApp;
  eluvioTenantId;
  l10n = LocalizationEN;
  pathname = location.pathname;
  toastMessage = "";
  showToastMessage = false;
  showLoginGate = false;
  releaseNotes;

  logFrameCalls = false;

  get darkMode() {
    if(!this.activeApp) { return false; }

    const darkModeApps = ["Video Editor"];

    return !!darkModeApps.find(app => this.activeApp.includes(app));
  }

  Log(message="", error=false) {
    // eslint-disable-next-line no-console
    const logMethod = error === "warn" ? console.warn : error ? console.error : console.log;

    if(typeof message === "string") {
      message = `Core | ${message}`;
    }

    logMethod(message);
  }

  constructor() {
    makeAutoObservable(this);

    this.accountsStore = new AccountStore(this);
    this.tenantStore = new TenantStore(this);

    this.InitializeClient();
  }

  ResetTenancy() {
    this.tenantStore.Reset();
  }

  SetActiveApp(app) {
    this.activeApp = app;
  }

  InitializeClient = flow(function * (signer) {
    this.configError = false;

    try {
      let searchClientPromise;
      if(signer) {
        // Start search client initialization
        searchClientPromise = this.InitializeSearchClient(signer);
      }

      this.client = yield ElvClient.FromConfigurationUrl({
        configUrl: EluvioConfiguration["config-url"],
        ethereumContractTimeout: 20
      });

      this.walletClient = yield ElvWalletClient.Initialize({
        client: this.client,
        appId: "elv-core",
        network: this.client.networkName.includes("demo") ? "demo" : "main",
        mode: this.client.networkName.includes("demo") ? "staging" : "production",
        skipMarketplaceLoad: true,
        storeAuthToken: false
      });

      this.client.walletClient = this.walletClient;

      yield searchClientPromise;
    } catch (error) {
      this.Log(error, true);
      this.configError = true;
      return;
    }

    this.eluvioTenantId =
      this.client.networkName.includes("demo") ?
        "iten3HEEASRTo2rNLeeKw4cfq4sPuX6" :
        "iten34Y7Tzso2mRqhzZ6yJDZs2Sqf8L";

    const networkInfo = this.client.NetworkInfo();
    this.networkName = networkInfo.name;

    if((new URLSearchParams(window.location.search).has("debug"))) {
      this.client.ToggleLogging(true);
    }

    if(
      ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
      (new URLSearchParams(window.location.search).has("simplePasswords")) ||
      (new URLSearchParams(window.location.search).has("sp"))
    ) {
      this.simplePasswords = true;
    }

    window.client = this.client;

    try {
      if(signer) {
        this.client.SetSigner({signer});

        yield this.walletClient.SetAuthorization({
          fabricToken: yield this.client.CreateFabricToken({
            duration: 24 * 60 * 60 * 1000,
            address: signer.address
          }),
          address: this.client.utils.FormatAddress(signer.address),
          duration: 24 * 60 * 60 * 1000,
          walletType: "Private Key",
          walletName: "Private Key"
        });

        this.signerSet = true;
      } else {
        this.signerSet = false;

        // Add dummy account to facilitate basic interaction with contracts
        const wallet = this.client.GenerateWallet();
        this.client.SetSigner({
          signer: wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()})
        });
      }

      if(!this.accountsStore.accountsLoaded) {
        this.accountsStore.LoadAccounts();
      }
    } catch (error) {
      this.configError = true;
      this.Log("Ethereum Check Failed:", true);
      this.Log(error, true);
    }
  });

  InitializeSearchClient = flow(function * (signer) {
    try {
      const {
        contentSpaceId,
        networkId,
        networkName,
        fabricURIs,
        ethereumURIs,
        authServiceURIs,
        fileServiceURIs,
        searchURIs,
        fabricVersion,
        configUrl
      } = yield ElvClient.Configuration({
        configUrl: EluvioConfiguration["config-url"]
      });

      const client = new ElvClient({
        contentSpaceId,
        networkId,
        networkName,
        fabricVersion,
        fabricURIs,
        ethereumURIs,
        authServiceURIs,
        fileServiceURIs,
        searchURIs,
        ethereumContractTimeout: 20,
        noCache: false,
        noAuth: false,
        assumeV3: false,
        service: "search"
      });

      client.configUrl = configUrl;

      this.searchClient = client;
    } catch (error) {
      this.Log(error, true);
    }

    try {
      if(signer) {
        this.searchClient.SetSigner({signer});
      } else {
        // Add dummy account to facilitate basic interaction with contracts
        const wallet = this.searchClient.GenerateWallet();
        this.searchClient.SetSigner({
          signer: wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()})
        });
      }
    } catch (error) {
      this.configError = true;

      this.Log("Ethereum Check Failed:", true);
      this.Log(error, true);
    }
  });

  LoadReleaseNotes = flow(function * () {
    if(!this.releaseNotes) {
      this.releaseNotes = ((yield this.client.ContentObjectMetadata({
        libraryId: this.client.walletClient.mainSiteLibraryId,
        objectId: this.client.walletClient.mainSiteId,
        metadataSubtree: "public/asset_metadata/info/release_notes"
      })) || [])
        .sort((a, b) => a.date < b.date ? 1 : -1);
    }

    return this.releaseNotes;
  });

  SetToastMessage(message) {
    clearTimeout(this.toastMessageTimeout);

    this.toastMessage = message;
    this.showToastMessage = true;
    this.toastMessageTimeout = setTimeout(() => this.showToastMessage = false, 5000);
  }

  SetPathname(pathname) {
    this.pathname = pathname;
  }

  SetShowLoginGate(show) {
    this.showLoginGate = show;
  }

  SetFrameClientLogging(enabled) {
    this.logFrameCalls = enabled;
  }
}

const root = new RootStore();

export const rootStore = root;
export const accountsStore = rootStore.accountsStore;
export const tenantStore = rootStore.tenantStore;

window.rootStore = rootStore;
