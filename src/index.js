import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createHashHistory } from "history";
import { createStore, applyMiddleware } from "redux";
import Thunk from "redux-thunk";
import { ConnectedRouter, connectRouter } from "connected-react-router";
import { Route, Switch } from "react-router-dom";

import { SetAccounts } from "./actions/Accounts";
import Accounts from "./components/Accounts";
import AccountForm from "./components/AccountForm";
import Notifications from "./components/Notifications";
import RootReducer from "./reducers/index";

import Header from "./components/Header";
import AppFrame from "./components/AppFrame";
import LoginForm from "./components/LoginForm";

import "./static/stylesheets/app.scss";
import {SeedAccounts} from "./utils/SeedAccounts";
import TransferForm from "./components/TransferForm";
import {ElvClient} from "elv-client-js/src/ElvClient";
import AccountManager from "./utils/AccountManager";
import Redirect from "react-router/es/Redirect";

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
              <Header />
              <Notifications />
              <div className="route-container">
                <Switch>
                  <Route exact path="/" render={() => <Redirect to={"/apps/fabric-browser"} />} />
                  <Route path="/apps/:appName" component={AppFrame} />
                  <Route exact path="/accounts" component={Accounts} />
                  <Route exact path="/accounts/transfer" component={TransferForm} />
                  <Route exact path="/accounts/add-account" component={AccountForm} />
                  <Route exact path="/accounts/log-in/:accountAddress" component={LoginForm} />
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
