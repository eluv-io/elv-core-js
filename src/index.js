import "@babel/polyfill";
import "./static/stylesheets/defaults.scss";

import React from "react";
import { render } from "react-dom";
import { HashRouter } from "react-router-dom";

import * as Stores from "./stores";
import {observer, Provider} from "mobx-react";
import {accountsStore, rootStore} from "./stores";

import {Action, ErrorHandler} from "elv-components-js";

import Header from "./components/Header";
import Navigation from "./components/Navigation";

import AppRoutes from "./Routes";
import {Group, Loader, MantineProvider} from "@mantine/core";

const App = observer(() => {
  if(rootStore.configError) {
    return (
      <div className="page-error">
        <div className="page-error-container">
          <h1>
            Unable to load client configuration
          </h1>
          <h1>
            {EluvioConfiguration["config-url"]}
          </h1>

          <Action onClick={() => rootStore.InitializeClient()}>
            Retry
          </Action>
        </div>
      </div>
    );
  }

  if(!rootStore.client || !accountsStore.accountsLoaded) {
    return (
      <Group h="100vh" align="center" position="center">
        <Loader />
      </Group>
    );
  }

  return (
    <HashRouter>
      <div className="router-container">
        <Header />
        <Navigation />
        <AppRoutes />
      </div>
    </HashRouter>
  );
});

const AppComponent = ErrorHandler(App);

render(
  (
    <React.Fragment>
      <Provider {...Stores}>
        <MantineProvider withGlobalStyles>
          <AppComponent />
        </MantineProvider>
      </Provider>
      <div className="app-version">{EluvioConfiguration.version}</div>
    </React.Fragment>
  ),
  document.getElementById("app")
);
