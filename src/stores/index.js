import {configure, flow, makeAutoObservable} from "mobx";
import {ElvClient, ElvWalletClient, Utils} from "@eluvio/elv-client-js";
import AccountStore from "./Accounts";
import TenantStore from "./Tenant";

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

  constructor() {
    makeAutoObservable(this);

    this.accountsStore = new AccountStore(this);
    this.tenantStore = new TenantStore(this);

    this.InitializeClient();
  }

  ResetTenancy() {
    this.tenantStore.Reset();
  }

  InitializeClient = flow(function * (signer) {
    this.configError = false;

    try {
      this.client = yield ElvClient.FromConfigurationUrl({
        configUrl: EluvioConfiguration["config-url"],
        ethereumContractTimeout: 20
      });

      this.walletClient = yield ElvWalletClient.Initialize({
        client: this.client,
        appId: "elv-core",
        network: EluvioConfiguration["config-url"].includes("main.955305") ? "main" : "demo",
        mode: EluvioConfiguration["config-url"].includes("main.955305") ? "production" : "staging",
        skipMarketplaceLoad: true,
        storeAuthToken: false
      });

      this.client.walletClient = this.walletClient;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      this.configError = true;
      return;
    }

    const networkInfo = this.client.NetworkInfo();
    this.networkName = networkInfo.name;

    if((new URLSearchParams(window.location.search).has("debug"))) {
      this.client.ToggleLogging(true);
    }

    if(
      window.location.hostname === "localhost" ||
      (new URLSearchParams(window.location.search).has("simplePasswords"))
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
        yield this.InitializeSearchClient(signer);
      } else {
        this.signerSet = false;

        // Add dummy account to facilitate basic interaction with contracts
        const wallet = this.client.GenerateWallet();
        this.client.SetSigner({
          signer: wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()})
        });
      }

      yield this.client.CallContractMethod({
        contractAddress: this.client.contentSpaceAddress,
        methodName: "version"
      });

      if(!this.accountsStore.accountsLoaded) {
        this.accountsStore.LoadAccounts();
      }
    } catch (error) {
      this.configError = true;
      // eslint-disable-next-line no-console
      console.error("Ethereum Check Failed:");
      // eslint-disable-next-line no-console
      console.error(error);
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
      // eslint-disable-next-line no-console
      console.log(error);
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

      yield this.searchClient.CallContractMethod({
        contractAddress: this.searchClient.contentSpaceAddress,
        methodName: "version"
      });
    } catch (error) {
      this.configError = true;
      // eslint-disable-next-line no-console
      console.error("Ethereum Check Failed:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });
}

const root = new RootStore();

export const rootStore = root;
export const accountsStore = rootStore.accountsStore;
export const tenantStore = rootStore.tenantStore;

window.rootStore = rootStore;
