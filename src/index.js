import "@babel/polyfill";
import "./static/stylesheets/defaults.scss";

import React from "react";
import { render } from "react-dom";
import {BrowserRouter} from "react-router-dom";

import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";

import {Action, ErrorHandler} from "elv-components-js";

import Header from "./Header";
import Navigation from "./Navigation";

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
    <BrowserRouter>
      <div className="router-container">
        <Header />
        <Navigation />
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
});

const AppComponent = ErrorHandler(App);

const element = document.createElement("div");
element.id = "app";
document.body.appendChild(
  element
);

render(
  (
    <React.Fragment>
      <MantineProvider withGlobalStyles>
        <AppComponent />
      </MantineProvider>
      <div className="app-version">{EluvioConfiguration.version}</div>
    </React.Fragment>
  ),
  document.getElementById("app")
);
