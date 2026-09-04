import "@mantine/core/styles.css";
import "./static/stylesheets/defaults.scss";

import React from "react";
import { createRoot } from "react-dom/client";
import {MantineProvider} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import MantineTheme from "./static/MantineTheme";
import App from "./App";

const Initialize = () => {
  const element = document.createElement("div");
  element.id = "app";
  document.body.appendChild(
    element
  );

  const root = createRoot(document.getElementById("app"));

  root.render(
    <React.Fragment>
      {/*
        `withGlobalStyles` was a Mantine 6 prop and a no-op in v7.
        `forceColorScheme` pinned the app to light while the dark tokens were
        still empty; both are gone now that they are filled in.

        "auto" is the starting point, not a lock: ColorSchemeControl in the
        account menu lets the viewer pick System / Light / Dark, and Mantine's
        default localStorageColorSchemeManager persists it under
        `mantine-color-scheme-value`. index.html reads that same key before
        first paint.
      */}
      <MantineProvider theme={MantineTheme} defaultColorScheme="auto">
        <ModalsProvider>
          <App/>
        </ModalsProvider>
      </MantineProvider>
      <div className="app-version">{EluvioConfiguration.version}</div>
    </React.Fragment>
  );
};

// Redirect old offerings url
if(window.location.pathname === "/offerings") {
  window.location.href = "https://eluv.io";
} else {
  Initialize();
}
