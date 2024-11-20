import AccountStyles from "../../static/stylesheets/modules/accounts.module.scss";

import {observer} from "mobx-react";
import {accountsStore} from "../../stores";
import {Button, FileButton, Group, Text} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {CreateModuleClassMatcher} from "../../Utils";

import {Utils} from "@eluvio/elv-client-js";
import {ButtonWithLoader, ImageIcon} from "../Misc";
import {LoginGateModal} from "../login/Login";
import {modals} from "@mantine/modals";

import XIcon from "../../static/icons/X.svg";
import DefaultAccountImage from "../../static/icons/User.svg";

const S = CreateModuleClassMatcher(AccountStyles);

const Account = observer(({address}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const account = accountsStore.accounts[address];


  if(!account) { return null; }

  const profileImage = accountsStore.ResizeImage(account.imageUrl, 200) || DefaultAccountImage;
  const accountLocked = !account.signer;
  const isCurrentAccount = Utils.EqualAddress(accountsStore.currentAccountAddress, account.address);

  return (
    <>
      {
        !showLoginModal ? null :
          <LoginGateModal
            address={address}
            Close={() => setShowLoginModal(false)}
          />
      }
      <div className={S("account")}>
        <button
          title="Remove Account"
          onClick={() => modals.openConfirmModal({
            title: `Remove ${account?.name || account?.email || "Account"}`,
            children: <Text my="md">Are you sure you want to remove this account?</Text>,
            onConfirm: async () => await accountsStore.RemoveAccount(address),
            labels: { confirm: "Confirm", cancel: "Cancel" },
            centered: true
          })}
          className={S("remove-account")}
        >
          <ImageIcon icon={XIcon} />
        </button>

        <div className={S("round-image", "image")}>
          <ImageIcon
            icon={profileImage}
            alternateIcon={DefaultAccountImage}
          />
        </div>
        <div className={S("text")}>
          <div title={account.name || account.address} className={S("name", "ellipsis")}>
            {account.name || address}
          </div>
          {
            !account.tenantName ? null :
              <div title={account.address} className={S("tenant", "ellipsis")}>
                Tenant: {account.tenantName}
              </div>
          }
          <div title={account.address} className={S("address", "ellipsis")}>
            {address}
          </div>
        </div>
        <div className={S("actions")}>
          {
            isCurrentAccount && !accountLocked ?
              <ButtonWithLoader
                className={S("action")}
                variant="filled"
                w="100%"
                onClick={async () => await accountsStore.LockAccount({address})}
              >
                Sign Out
              </ButtonWithLoader> :
              <ButtonWithLoader
                className={S("action")}
                variant="outline"
                w="100%"
                onClick={async () => {
                  if(accountsStore.currentAccountAddress) {
                    try {
                      await accountsStore.LockAccount({address: accountsStore.currentAccountAddress});
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      console.error(error);
                    }
                  }

                  await accountsStore.SetCurrentAccount({address: address});

                  setShowLoginModal(true);
                }}
              >
                Sign In
              </ButtonWithLoader>
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
        <Group justify="center">
          <Button variant="outline" color="gray.6" onClick={() => accountsStore.ExportAccounts()}>
            Export Accounts
          </Button>
          <FileButton
            color="gray.6"
            accept=".elv"
            onChange={async file => {
              accountsStore.ImportAccounts(await file.text());
            }}
          >
            {(props) => <Button {...props} variant="outline">Import Accounts</Button>}
          </FileButton>
        </Group>
      </div>
    </div>
  );
});

export default Accounts;
