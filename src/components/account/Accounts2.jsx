import AccountStyles from "../../static/stylesheets/modules/accounts.module.scss";

import {observer} from "mobx-react";
import {accountsStore} from "../../stores";
import {Button, FileButton} from "@mantine/core";
import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {CreateModuleClassMatcher} from "../../Utils";

import DefaultAccountImage from "../../static/icons/User.svg";
import LoginModal from "../login/LoginModal";
import {Utils} from "@eluvio/elv-client-js";
import {ButtonWithLoader, ImageIcon} from "../Misc";

const S = CreateModuleClassMatcher(AccountStyles);

const Account = observer(({address}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const account = accountsStore.accounts[address];


  if(!account) { return null; }

  const profileImage = accountsStore.ResizeImage(account.imageUrl, 200) || DefaultAccountImage;
  const accountLocked = !account.signer;
  const isCurrentAccount = Utils.EqualAddress(accountsStore.currentAccountAddress, account.address);

  return (
    <>
      {
        !showLoginModal ? null :
          <LoginModal address={address} Close={() => setShowLoginModal(false)}/>
      }
      <div className={S("account")}>
        <div className={S("image-container")}>
          <ImageIcon
            icon={profileImage}
            alternateIcon={DefaultAccountImage}
            className={S("image")}
          />
        </div>
        <div className={S("text")}>
          <div title={account.name || account.address} className={S("name", "ellipsis")}>
            {account.name || address}
          </div>
          <div title={account.address} className={S("address", "ellipsis")}>
            {address}
          </div>
        </div>
        <div className={S("actions")}>
          {
            isCurrentAccount && !accountLocked ?
              <Button
                variant="filled"
                w="100%"
                loading={signingOut}
                onClick={() => {
                  setSigningOut(true);
                  accountsStore.LockAccount({address})
                    .finally(() => setSigningOut(false));
                }}
              >
                Sign Out
              </Button> :
              <Button
                variant="outline"
                w="100%"
                loading={signingOut}
                onClick={async () => {
                  if(accountsStore.currentAccountAddress) {
                    setSigningOut(true);
                    try {
                      await accountsStore.LockAccount({address: accountsStore.currentAccountAddress});
                    } finally {
                      setSigningOut(false);
                    }
                  }

                  setShowLoginModal(true);
                }}
              >
                Sign In
              </Button>
          }
        </div>
      </div>
    </>
  );
});

const Accounts = observer(() => {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div className={S("accounts-page")}>
        <div className={S("add-account")}>
          <p>Add/Switch Accounts</p>
          <ButtonWithLoader
            onClick={async () => {
              try {
                await accountsStore.LogOutOry();
              } finally {
                navigate("/login");
              }
            }}
          >
            Add Account
          </ButtonWithLoader>
        </div>
        <div className={S("accounts")}>
          {accountsStore.sortedAccounts.map(address =>
            <Account address={address} key={`account-${address}`} />
          )}
        </div>
        <div className={S("actions")}>
          <Button variant="outline" onClick={() => accountsStore.ExportAccounts()}>
            Export Accounts
          </Button>
          <FileButton
            accept=".elv"
            onChange={async file => {
              accountsStore.ImportAccounts(await file.text());
            }}
          >
            {(props) => <Button {...props} variant="outline">Import Accounts</Button>}
          </FileButton>
        </div>
      </div>
    </div>
  );
});

export default Accounts;
