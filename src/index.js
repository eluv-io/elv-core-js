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
      <MantineProvider withGlobalStyles theme={MantineTheme}>
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
