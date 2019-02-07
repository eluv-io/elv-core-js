import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createHashHistory } from "history";
import { createStore, applyMiddleware } from "redux";
import Thunk from "redux-thunk";
import { ConnectedRouter, connectRouter } from "connected-react-router";
import { Route, Switch } from "react-router-dom";

import { SetAccounts } from "./actions/Accounts";
import Notifications from "./components/Notifications";
import RootReducer from "./reducers/index";
import AppFrame from "./components/AppFrame";

import "./static/stylesheets/app.scss";
import {SeedAccounts} from "./utils/SeedAccounts";
import {ElvClient} from "elv-client-js/src/ElvClient";
import AccountManager from "./utils/AccountManager";
import Redirect from "react-router/es/Redirect";
import {
  AccountFormContainer,
  AccountsContainer, HeaderContainer,
  LoginFormContainer,
  ProfileContainer,
  TransferFormContainer
} from "./containers/Accounts";
import AppSelector from "./components/AppSelector";

const InitializeClient = (signer) => {
  const client = ElvClient.FromConfiguration({configuration: require("../configuration.json")});

  if(signer) {
    client.SetSigner({signer});
  }

  return client;
};

export class AccountManagerApp extends React.Component {
  constructor(props) {
    super(props);

    const history = createHashHistory();

    const client = InitializeClient();
    const accountManager = new AccountManager({elvWallet: client.GenerateWallet()});

    const initialState = {
      accounts: {
        accountManager
      },
      client: {
        client
      }
    };

    const store = createStore(
      connectRouter(history)(RootReducer),
      initialState,
      applyMiddleware(Thunk),
    );

    this.state = {
      store,
      history
    };
  }

  // Wait for seed to finish
  componentDidMount() {
    const client = this.state.store.getState().client.client;
    const accountManager = this.state.store.getState().accounts.accountManager;

    SeedAccounts(this.state.store, client, accountManager).then(() => {
      this.state.store.dispatch(SetAccounts({
        client,
        accountManager
      }));

      this.setState({
        ready: true
      });
    });
  }

  render() {
    if(!this.state.ready) { return null; }

    return (
      <Provider store={this.state.store}>
        <div className="app-container">
          <ConnectedRouter history={this.state.history}>
            <div className="account-manager-container">
              <HeaderContainer />
              <Notifications />
              <div className="route-container">
                <Switch>
                  <Route exact path="/" render={() => <Redirect to={"/apps"} />} />
                  <Route exact path="/apps" component={AppSelector} />
                  <Route path="/apps/:appName" component={AppFrame} />
                  <Route exact path="/accounts" component={AccountsContainer} />
                  <Route exact path="/accounts/transfer" component={TransferFormContainer} />
                  <Route exact path="/accounts/add-account" component={AccountFormContainer} />
                  <Route exact path="/accounts/:accountAddress/profile" component={ProfileContainer} />
                  <Route exact path="/accounts/:accountAddress/log-in" component={LoginFormContainer} />
                </Switch>
              </div>
            </div>
          </ConnectedRouter>
        </div>
      </Provider>
    );
  }
}

render(
  <AccountManagerApp />,
  document.getElementById("app")
);
