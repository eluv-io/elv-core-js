import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import React, {useEffect} from "react";
import {observer} from "mobx-react";
import {CreateModuleClassMatcher} from "../../Utils";

import SplashBackground from "../../static/images/SplashBackground.jpg";
import EluvioLogo from "../../static/images/Main_Logo_Light";
import {Button, FileButton, UnstyledButton} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import {rootStore, accountsStore} from "../../stores";

const S = CreateModuleClassMatcher(LoginStyles);

const Actions = observer(() => {
  const navigate = useNavigate();
  const onboard = rootStore.pathname.startsWith("/onboard");

  useEffect(() => {
    if(!onboard) { return; }

    accountsStore.LogOutOry();
  }, []);

  if(onboard) {
    return (
      <div className={S("splash-page__actions")}>
        <Button
          w={200}
          h={50}
          fz={18}
          onClick={() => navigate(`/onboard/login?obp=${new URLSearchParams(window.location.search).get("obp")}`)}
          className={S("splash-page__action")}
        >
          GET STARTED
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={S("splash-page__actions")}>
        <Button
          w={200}
          h={50}
          fz={18}
          onClick={() => navigate(accountsStore.hasAccount ? "/apps" : "/login")}
          className={S("splash-page__action")}
        >
          {
            accountsStore.hasAccount ?
              "JUMP BACK IN" :
              "SIGN IN"
          }
        </Button>
      </div>
      <div className={S("splash-page__actions")}>
        <FileButton
          accept=".elv"
          h={50}
          w={200}
          onChange={async file => {
            await accountsStore.ImportAccounts(await file.text());

            navigate("/accounts");
          }}
        >
          {(props) =>
            <UnstyledButton
              {...props}
              variant="outline"
              className={S("splash-page__import")}
            >
              Import Accounts
            </UnstyledButton>
          }
        </FileButton>
      </div>
    </>
  );
});

const SplashPage = observer(() => {
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
          <img src={EluvioLogo} alt="Eluvio" className={S("splash-page__logo")}/>
          <div className={S("splash-page__logo-tagline")}>
              Content Fabric
          </div>
        </div>
        <Actions/>
      </div>
    </div>
  );
});

export default SplashPage;
