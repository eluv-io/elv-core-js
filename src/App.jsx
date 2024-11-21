import "./static/stylesheets/modules/shared.module.scss";

import React from "react";
import {BrowserRouter} from "react-router-dom";

import {observer} from "mobx-react";
import {accountsStore, rootStore} from "./stores";

import Header from "./Header";
import AppRoutes from "./Routes";
import {Button, Group, Loader, Text} from "@mantine/core";
import ScrollToTop from "./ScrollToTop";
import Footer from "./Footer";
import {CreateModuleClassMatcher} from "./Utils";

const S = CreateModuleClassMatcher();

const ToastMessage = observer(() => {
  return (
    <div className={S("toast-message", !rootStore.showToastMessage ? "toast-message__dismissed" : "")}>
      <div className={S("toast-message__message")}>
        { rootStore.toastMessage }
      </div>
    </div>
  );
});

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
        <Loader color="gray.6" />
      </Group>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`router-container ${rootStore.activeApp ? "router-container--app" : ""}`}>
        {
          rootStore.pathname === "/" ? null :
            <Header />
        }
        {
          accountsStore.loadingAccount || !accountsStore.currentAccount?.lowBalance ? null :
            <Text ta="center" mt={50} fw={500} className={S("message")}>
              This account has an insufficient balance. Please fund the account to proceed.
            </Text>
        }
        <ToastMessage />
        <AppRoutes />
        {
          rootStore.activeApp ? null :
            <Footer />
        }
      </div>
    </BrowserRouter>
  );
});

export default App;
