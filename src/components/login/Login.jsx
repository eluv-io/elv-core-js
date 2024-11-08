import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import {observer} from "mobx-react";
import {accountsStore} from "../../stores";
import {Button, Checkbox, Modal, Switch} from "@mantine/core";
import React, {useState} from "react";
import {CreateModuleClassMatcher} from "../../Utils";
import AccountForm from "../account/AccountForm";
import {Navigate} from "react-router";
import OryForm from "../account/OryForm";

import EluvioLogo from "../../static/images/Main_Logo_Light";

const S = CreateModuleClassMatcher(LoginStyles);

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
          h={45}
          loading={submitting}
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
