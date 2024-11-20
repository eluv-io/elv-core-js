import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import React from "react";
import {observer} from "mobx-react";
import {CreateModuleClassMatcher} from "../../Utils";

import SplashBackground from "../../static/images/SplashBackground.jpg";
import EluvioLogo from "../../static/images/Main_Logo_Light";
import {Button} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import {accountsStore} from "../../stores";

const S = CreateModuleClassMatcher(LoginStyles);

const SplashPage = observer(() => {
  const navigate = useNavigate();
  return (
    <div className={S("splash-page")}>
      <div
        style={{backgroundImage: `url(${SplashBackground})`}}
        className={S("splash-page__background")}
      />
      <div className={S("splash-page__content")}>
        <div className={S("splash-page__welcome")}>
          Welcome to
        </div>
        <div className={S("splash-page__logo-container")}>
          <img src={EluvioLogo} alt="Eluvio" className={S("splash-page__logo")} />
          <div className={S("splash-page__logo-tagline")}>
            Content Fabric
          </div>
        </div>
        <div className={S("splash-page__actions")}>
          {
            !accountsStore.hasAccount ? null :
              <Button
                w={150}
                h={50}
                fz={18}
                onClick={() => navigate("/apps")}
                className={S("splash-page__action")}
              >
                APPS
              </Button>
          }
          <Button
            w={150}
            h={50}
            fz={18}
            color="gray.6"
            onClick={() => navigate(accountsStore.hasAccount ? "/accounts" : "/login")}
            className={S("splash-page__action")}
          >
            SIGN IN
          </Button>
        </div>
      </div>
    </div>
  );
});

export default SplashPage;
