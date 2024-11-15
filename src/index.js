import "@mantine/core/styles.css";
import "./static/stylesheets/defaults.scss";
import "./static/stylesheets/modules/shared.module.scss";

import React from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter} from "react-router-dom";

import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";

import Header from "./Header";
import AppRoutes from "./Routes";
import {Button, Group, Loader, MantineProvider, Text} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import ScrollToTop from "./ScrollToTop";
import Footer from "./Footer";
import MantineTheme from "./static/MantineTheme";
import {CreateModuleClassMatcher} from "./Utils";

const S = CreateModuleClassMatcher();

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

          <Button onClick={() => rootStore.InitializeClient()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if(!rootStore.client || !accountsStore.accountsLoaded || accountsStore.authenticating) {
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
        {
          accountsStore.loadingAccount || !accountsStore.currentAccount?.lowBalance ? null :
            <Text ta="center" mt={50} fw={500} className={S("message")}>
              This account has an insufficient balance. Please fund the account to proceed.
            </Text>
        }
        <AppRoutes />
        {
          rootStore.activeApp ? null :
            <Footer />
        }
      </div>
    </BrowserRouter>
  );
});


const element = document.createElement("div");
element.id = "app";
document.body.appendChild(
  element
);

const root = createRoot(document.getElementById("app"));
root.render(
  <React.Fragment>
    <MantineProvider withGlobalStyles theme={MantineTheme}>
      <ModalsProvider>
        <App />
      </ModalsProvider>
    </MantineProvider>
    <div className="app-version">{EluvioConfiguration.version}</div>
  </React.Fragment>
);
