import "@mantine/core/styles.css";
import "./static/stylesheets/defaults.scss";
import "./static/stylesheets/modules/shared.module.scss";

import React from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter} from "react-router-dom";

import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";

import {Action, ErrorHandler} from "elv-components-js";

import Header from "./Header";
import Navigation from "./Navigation";

import AppRoutes from "./Routes";
import {Group, Loader, MantineProvider} from "@mantine/core";
import ScrollToTop from "./ScrollToTop";
import Footer from "./Footer";
import MantineTheme from "./static/MantineTheme";

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
      <Group h="100vh" align="center" justify="center">
        <Loader />
      </Group>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`router-container ${rootStore.activeApp ? "router-container--app" : ""}`}>
        <Header />
        <Navigation />
        <AppRoutes />
        {
          rootStore.activeApp ? null :
            <Footer />
        }
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

const root = createRoot(document.getElementById("app"));
root.render(
  <React.Fragment>
    <MantineProvider withGlobalStyles theme={MantineTheme}>
      <AppComponent />
    </MantineProvider>
    <div className="app-version">{EluvioConfiguration.version}</div>
  </React.Fragment>
);
