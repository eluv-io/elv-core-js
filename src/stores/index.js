import {configure, observable, action, flow} from "mobx";
import {ElvClient} from "@eluvio/elv-client-js";
import AccountStore from "./Accounts";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable configError = false;
  @observable client;
  @observable signerSet = false;
  @observable showHeader = true;
  @observable simplePasswords = false;

  constructor() {
    this.accountsStore = new AccountStore(this);

    this.InitializeClient();
  }

  @action.bound
  InitializeClient = flow(function * (signer) {
    this.configError = false;

    try {
      this.client = yield ElvClient.FromConfigurationUrl({
        configUrl: EluvioConfiguration["config-url"],
        ethereumContractTimeout: 20
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      this.configError = true;
      return;
    }

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
        this.signerSet = true;
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

  @action.bound
  ToggleHeader(show) {
    this.showHeader = show;
  }
}

const root = new RootStore();

export const rootStore = root;
export const accountsStore = rootStore.accountsStore;
