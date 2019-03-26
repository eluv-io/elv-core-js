import "./static/stylesheets/defaults.scss";

import React from "react";
import { render } from "react-dom";
import { Route, Switch } from "react-router-dom";
import HashRouter from "react-router-dom/es/HashRouter";
import Redirect from "react-router/es/Redirect";

import {ElvCoreProvider} from "./ElvCoreContext";

import HeaderContainer from "./containers/Header";
import NavigationContainer from "./containers/Navigation";
import AppsContainer from "./containers/Apps";
import AppFrameContainer from "./containers/AppFrame";
import ProfileContainer from "./containers/Profile";
import AccountsContainer from "./containers/Accounts";
import AccountFormContainer from "./containers/AccountForm";
import TransferFormContainer from "./containers/TransferForm";
import EnforceLoginContainer from "./EnforceLogin";

class ElvCore extends React.Component {
  render() {
    return (
      <ElvCoreProvider>
        <HeaderContainer />
        <NavigationContainer />
        <EnforceLoginContainer>
          <Switch>
            <Route exact path="/apps" component={AppsContainer} />
            <Route path="/apps/:app" component={AppFrameContainer} />

            <Route exact path="/profile" component={ProfileContainer} />

            <Route exact path="/accounts" component={AccountsContainer} />
            <Route exact path="/accounts/add" component={AccountFormContainer} />

            <Route exact path="/transfer" component={TransferFormContainer} />
            <Route render={() => <Redirect to="/accounts"/>} />
          </Switch>
        </EnforceLoginContainer>
      </ElvCoreProvider>
    );
  }
}

class App extends React.PureComponent {
  render() {
    return (
      <HashRouter>
        <div className="router-container">
          <ElvCore />
        </div>
      </HashRouter>
    );
  }
}

render(
  <App />,
  document.getElementById("app")
);
