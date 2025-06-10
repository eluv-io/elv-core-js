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
import {CreateModuleClassMatcher} from "./utils/Utils";

const S = CreateModuleClassMatcher();

const ToastMessage = observer(() => {
  if(rootStore.activeApp) {
    //return null;
  }

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
      <div className={S("page-error")}>
        <h1>
          Unable to load client configuration
        </h1>
        <h1>
          {EluvioConfiguration["config-url"]}
        </h1>

        <Button w={120} mt="md" onClick={() => rootStore.InitializeClient()}>
          Retry
        </Button>
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

  const showBalanceWarning = !(
    rootStore.pathname === "/" ||
    accountsStore.loadingAccount ||
    !accountsStore.isUnlocked ||
    !accountsStore.currentAccount?.lowBalance
  );

  const showTenantIdWarning = !(
    rootStore.pathname === "/" ||
    rootStore.pathname.startsWith("/onboard") ||
    rootStore.pathname.startsWith("/apps/") ||
    accountsStore.loadingAccount ||
    !accountsStore.isUnlocked ||
    accountsStore.currentAccount?.tenantContractId
  );

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`router-container ${rootStore.activeApp ? "router-container--app" : ""}`}>
        {
          rootStore.pathname === "/" || rootStore.pathname.startsWith("/onboard") ? null :
            <Header />
        }
        {
          showBalanceWarning ?
            <Text ta="center" mt={50} fw={500} className={S("message")}>
              This account has an insufficient balance. Please fund the account to proceed.
            </Text> :
            showTenantIdWarning ?
              <Text ta="center" mt={50} fw={500} className={S("message")}>
                Tenant ID is not set for this account. Please set it in your profile page.
              </Text> : null
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
