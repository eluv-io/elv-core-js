import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import {observer} from "mobx-react";
import {accountsStore} from "../../stores";
import {Button, Checkbox, Group, Loader, Modal, PasswordInput, Text, Switch} from "@mantine/core";
import React, {useState} from "react";
import {CreateModuleClassMatcher} from "../../Utils";
import AccountForm from "../account/AccountForm";
import {Navigate} from "react-router";
import OryForm from "../account/OryForm";

import EluvioLogo from "../../static/images/Main_Logo_Light";
import {Link} from "react-router-dom";
import {AccountSelector} from "../account/AccountMenu";

const S = CreateModuleClassMatcher(LoginStyles);

const LoginGatePasswordForm = observer(({Close}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const Submit = async () => {
    setError(undefined);
    setSubmitting(true);

    try {
      await accountsStore.UnlockAccount({
        address: accountsStore.currentAccountAddress,
        password
      });

      Close?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setError(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={event => event.preventDefault()}>
      <AccountSelector center />
      <PasswordInput
        data-autofocus
        mt="xs"
        aria-label="Password"
        placeholder="Password"
        value={password}
        error={error}
        onChange={event => setPassword(event.currentTarget.value)}
        onKeyDown={event => {
          if(event.key !== "Enter") { return; }

          Submit();
        }}
      />
      <div className={S("actions")}>
        <Button
          fz="sm"
          disabled={!password}
          opacity={submitting ? 0.5 : 1}
          styles={{
            root: {
              transition: "opacity 0.25s ease"
            }
          }}
          type="button"
          w="100%"
          onClick={Submit}
          className={S("button")}
        >
          Submit
        </Button>
        <Link to="/accounts" onClick={() => Close?.()} className={S("button-link")}>
          Back to Accounts
        </Link>
      </div>
    </form>
  );
});

export const LoginGateModal = observer(({Close}) => {
  const [shareEmail, setShareEmail] = useState(true);
  const accountType = accountsStore.currentAccount?.type || "custodial";

  return (
    <Modal
      centered
      size="sm"
      w={200}
      opened
      onClose={Close}
      withCloseButton={false}
    >
      <div className={S("login-modal")}>
        <div className={S("header")}>
          <img src={EluvioLogo} className={S("header__logo")} />
          <div className={S("header__title")}>
            Content Fabric
          </div>
        </div>
        <div className={S("content")}>
          {
            accountType === "custodial" ?
              <OryForm
                userData={{share_email: shareEmail}}
                isLoginGate
                Close={Close}
              /> :
              <LoginGatePasswordForm Close={Close} />
          }
        </div>
        {
          accountType === "key" ? null :
            <div className={S("terms")}>
              <div className={S("terms__text")}>
                By creating an account or signing in, I agree to the <a target="_blank" href="https://eluv.io/privacy">Eluvio Privacy Policy</a> and the <a target="_blank" href="https://eluv.io/terms">Eluvio Terms and Conditions</a>
              </div>
              <div className={S("terms__option")}>
                <Checkbox size="xs" name="share-email" color="gray.3" checked={shareEmail} onChange={event => setShareEmail(event.currentTarget.checked)} />
                <label htmlFor="share-email" className={S("terms__text")}>
                  By checking this box, I give consent for my email address to be stored with my wallet address. Eluvio may also send informational and marketing emails to this address.
                </label>
              </div>
            </div>
        }
      </div>
    </Modal>
  );
});

export const LoginGate = observer(({children}) => {
  const currentAccount = accountsStore.currentAccount;

  if(!accountsStore.accountsLoaded || accountsStore.authenticating) {
    return (
      <Modal
        centered
        size="sm"
        w={200}
        opened
        withCloseButton={false}
      >
        <Text ta="center" fz="xl" my="lg">Authenticating...</Text>
        <Group justify="center" my="lg">
          <Loader />
        </Group>
      </Modal>
    );
  } else if(currentAccount?.signer && currentAccount?.balance < 0.1) {
    // No account or insufficient balance
    return <Navigate to="/accounts"/>;
  } else if(!currentAccount?.signer || accountsStore.loadingAccount) {
    return (
      <LoginGateModal />
    );
  }

  // Enforce tenant ID - Temporarily disabled
  /*
    else if(false && !currentAccount.tenantContractIda) {
      return (
        <LoginModal
          key="tenant-id-prompt"
          legend={"This account is not associated with a tenant. Please enter your tenant ID to proceed."}
          prompt={true}
          fields={[{name: "tenantContractId", label: "Tenant Contract ID", placeholder: "iten..."}]}
          Submit={async ({tenantContractId}) => await accountsStore.SetTenantContractId({id: tenantContractId})}
        />
      );
    }

   */

  return children;
});

const KeyForm = observer(({Close}) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <AccountForm UpdateFormData={setFormData} />
      <div className={S("actions")}>
        <Button
          disabled={!formData.valid}
          w="100%"
          loading={submitting}
          className={S("button")}
          onClick={async () => {
            setSubmitting(true);
            setError(undefined);

            try {
              await accountsStore.AddAccount({
                mnemonic: formData.mnemonic?.trim(),
                privateKey: formData.privateKey,
                encryptedPrivateKey: formData.encryptedPrivateKey,
                password: formData.password,
                passwordConfirmation: formData.passwordConfirmation
              });

              Close(true);
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(error);
              setError(error.toString());
              setSubmitting(false);
            }
          }}
        >
          Sign In
        </Button>
        <Link to="/accounts" onClick={() => Close?.()} className={S("button-link", "button-link--secondary")}>
          Back to Accounts
        </Link>
      </div>
      {
        !error ? null :
          <div className={S("error")}>
            { error }
          </div>
      }
    </>
  );
});

const LoginModal = observer(({Close}) => {
  const [shareEmail, setShareEmail] = useState(true);
  const [accountType, setAccountType] = useState("custodial");

  return (
    <Modal
      centered
      size="sm"
      w={200}
      opened
      onClose={Close}
      withCloseButton={false}
      classNames={{
        overlay: S("modal-overlay"),
      }}
    >
      <div className={S("login-modal")}>
        <div className={S("header")}>
          <img src={EluvioLogo} className={S("header__logo")} />
          <div className={S("header__title")}>
            Content Fabric
          </div>
        </div>
        <div className={S("content")}>
          <div className={S("type-selector")}>
            <label htmlFor="type" className={S("type-selector__label")}>Sign In With</label>
            <div className={S("type-selector__switch-label", accountType === "custodial" ? "type-selector__switch-label--active" : "")}>
              Email
            </div>
            <Switch
              color="gray.3"
              name="type"
              checked={accountType === "key"}
              onChange={event => setAccountType(event.target.checked ? "key" : "custodial")}
            />
            <div className={S("type-selector__switch-label", accountType === "key" ? "type-selector__switch-label--active" : "")}>
              Key
            </div>
          </div>
          {
            accountType === "custodial" ?
              <OryForm userData={{share_email: shareEmail}} Close={Close} /> :
              <KeyForm Close={Close} />
          }
        </div>
        {
          accountType === "key" ? null :
            <div className={S("terms")}>
              <div className={S("terms__text")}>
                By creating an account or signing in, I agree to the <a target="_blank" href="https://eluv.io/privacy">Eluvio Privacy Policy</a> and the <a target="_blank" href="https://eluv.io/terms">Eluvio Terms and Conditions</a>
              </div>
              <div className={S("terms__option")}>
                <Checkbox size="xs" name="share-email" color="gray.3" checked={shareEmail} onChange={event => setShareEmail(event.currentTarget.checked)} />
                <label htmlFor="share-email" className={S("terms__text")}>
                  By checking this box, I give consent for my email address to be stored with my wallet address. Eluvio may also send informational and marketing emails to this address.
                </label>
              </div>
            </div>
        }
      </div>
    </Modal>
  );
});

const Login = observer(() => {
  const [redirect, setRedirect] = useState(undefined);

  if(redirect) {
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className={S("page-content", "login-page")}>
      <LoginModal Close={success => setRedirect(success ? "/apps" : "/accounts")} />
    </div>
  );
});

export default Login;
