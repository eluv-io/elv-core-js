import {configure, observable, action, flow} from "mobx";
import {ElvClient} from "elv-client-js";
import AccountStore from "./Accounts";
import ProfilesStore from "./Profiles";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  @observable configError = false;
  @observable client;
  @observable signerSet = false;
  @observable showHeader = true;

  constructor() {
    this.accountStore = new AccountStore(this);
    this.profilesStore = new ProfilesStore(this);

    this.InitializeClient()
      .then(this.accountStore.LoadAccounts);
  }

  @action.bound
  InitializeClient = flow(function * (signer) {
    this.configError = false;

    try {
      this.client = yield ElvClient.FromConfigurationUrl({
        configUrl: EluvioConfiguration["config-url"]
      });
    } catch (error) {
      this.configError = true;
      return;
    }

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
  });

  @action.bound
  ToggleHeader(show) {
    this.showHeader = show;
  }
}

const rootStore = new RootStore();

export const root = rootStore;
export const accounts = rootStore.accountStore;
export const profiles = rootStore.profilesStore;
