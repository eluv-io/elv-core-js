import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import {observer} from "mobx-react";
import {rootStore, accountsStore, tenantStore} from "../../stores";
import {
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  PasswordInput,
  Text,
  Switch,
  UnstyledButton,
  TextInput
} from "@mantine/core";
import React, {useEffect, useRef, useState} from "react";
import {CreateModuleClassMatcher} from "../../utils/Utils";
import KeyForm from "./KeyForm";
import {Navigate} from "react-router";
import OryForm from "./OryForm";

import EluvioLogo from "../../static/images/Main_Logo_Light";
import {Link, useNavigate} from "react-router-dom";
import {AccountSelector} from "../account/AccountMenu";
import {ButtonWithLoader, DefaultProfileImage, ImageIcon} from "../Misc";

import EditIcon from "../../static/icons/edit.svg";
import DefaultProfileIcon from "../../static/icons/User";
import TenancyIcon from "../../static/icons/users.svg";

const S = CreateModuleClassMatcher(LoginStyles);

/* Login gate */

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

      Close?.(true);
    } catch (error) {
      accountsStore.Log(error, true);
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
        {
          !accountsStore.hasAccount ? null :
            <Link to="/accounts" onClick={() => Close?.()} className={S("button-link", "button-link--secondary")}>
              Back to Accounts
            </Link>
        }
      </div>
    </form>
  );
});

export const LoginGateModal = observer(({Close}) => {
  const [shareEmail, setShareEmail] = useState(true);
  const [closable, setClosable] = useState(true);
  const accountType = accountsStore.currentAccount?.type || "key";

  if(accountsStore.sortedAccounts.length === 0) {
    return <Navigate to="/" />;
  }

  return (
    <Modal
      centered
      size="sm"
      w={200}
      opened
      onClose={closable ? Close : () => {}}
      withCloseButton={false}
    >
      <div className={S("login-modal")}>
        <div className={S("header")}>
          <img alt="Eluvio Logo" src={EluvioLogo} className={S("header__logo")} />
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
                setClosable={setClosable}
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

  if(!accountsStore.accountsLoaded || accountsStore.authenticating || accountsStore.switchingAccounts) {
    return (
      <Modal
        centered
        size="sm"
        w={200}
        opened
        onClose={() => {}}
        withCloseButton={false}
      >
        <Text ta="center" fz="xl" my="lg">
          {
            accountsStore.switchingAccounts ?
              "Switching Accounts..." :
              "Authenticating..."
          }
        </Text>
        <Group justify="center" my="xl">
          <Loader />
        </Group>
      </Modal>
    );
  } else if(currentAccount?.signer && currentAccount?.balance < 0.1 && location.pathname !== "/profile") {
    // No account or insufficient balance
    return <Navigate to="/accounts"/>;
  } else if(!currentAccount?.signer || accountsStore.loadingAccount) {
    return <LoginGateModal Close={() => {}}/>;
  }

  return children;
});


/* Full page login for new accounts */


const KeyAccountForm = observer(({onboardParams, Close}) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const Submit = async () => {
    setSubmitting(true);
    setError(undefined);

    try {
      await accountsStore.AddAccount({
        mnemonic: formData.mnemonic?.trim(),
        privateKey: formData.privateKey,
        encryptedPrivateKey: formData.encryptedPrivateKey,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
        onboardParams
      });

      Close(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setError(error.toString());
      setSubmitting(false);
    }
  };

  return (
    <>
      <KeyForm onboardParams={onboardParams} UpdateFormData={setFormData} Submit={Submit} />
      <div className={S("actions")}>
        <Button
          disabled={!formData.valid}
          w="100%"
          loading={submitting}
          className={S("button")}
          onClick={Submit}
        >
          Sign In
        </Button>
        {
          !accountsStore.hasAccount ? null :
            <Link to="/accounts" onClick={() => Close?.()} className={S("button-link", "button-link--secondary")}>
              Back to Accounts
            </Link>
        }
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

const LoginModalContent = observer(({onboardParams, accountType, setAccountType, setClosable, Close}) => {
  const [shareEmail, setShareEmail] = useState(true);

  return (
    <>
      <div className={S("content")}>
        <div className={S("type-selector")}>
          <label htmlFor="type" className={S("type-selector__label")}>Sign In With</label>
          <div
            className={S("type-selector__switch-label", accountType === "custodial" ? "type-selector__switch-label--active" : "")}>
            Email
          </div>
          <Switch
            color="gray.3"
            name="type"
            checked={accountType === "key"}
            onChange={event => setAccountType(event.target.checked ? "key" : "custodial")}
          />
          <div
            className={S("type-selector__switch-label", accountType === "key" ? "type-selector__switch-label--active" : "")}>
            Key
          </div>
        </div>
        {
          accountType === "custodial" ?
            <OryForm
              onboardParams={onboardParams}
              userData={{share_email: shareEmail}}
              setClosable={setClosable}
              Close={Close}
            /> :
            <KeyAccountForm onboardParams={onboardParams} Close={Close}/>
        }
      </div>
      {
        accountType === "key" ? null :
          <div className={S("terms")}>
            <div className={S("terms__text")}>
              By creating an account or signing in, I agree to the <a target="_blank" href="https://eluv.io/privacy">Eluvio
              Privacy Policy</a> and the <a target="_blank" href="https://eluv.io/terms">Eluvio Terms and Conditions</a>
            </div>
            <div className={S("terms__option")}>
              <Checkbox
                size="xs"
                name="share-email"
                color="gray.3"
                checked={shareEmail}
                onChange={event => setShareEmail(event.currentTarget.checked)}
              />
              <label htmlFor="share-email" className={S("terms__text")}>
                By checking this box, I give consent for my email address to be stored with my wallet address. Eluvio
                may also send informational and marketing emails to this address.
              </label>
            </div>
          </div>
      }
    </>
  );
});

const TenantInfo = observer(({tenantContractId}) => {
  useEffect(() => {
    tenantStore.LoadPublicTenantMetadata({tenantContractId});
  }, [tenantContractId]);

  const metadata = tenantStore.tenantMetadata[tenantContractId]?.public;

  if(!metadata) {
    return null;
  }

  return (
    <Group justify="center">
      <div className={S("tenant-info")}>
        <div className={S("tenant-image", "tenant-info__image")}>
          <ImageIcon
            icon={metadata.image?.url}
            alternateIcon={TenancyIcon}
          />
        </div>
        <div className={S("tenant-info__text")}>
          <Text fw={500} fz={18} mt={5}>{metadata.name}</Text>
        </div>
      </div>
    </Group>
  );
});

const OnboardForm = observer(({onboardParams, Close}) => {
  const browseRef = useRef();
  const [name, setName] = useState(onboardParams.name || onboardParams.email);
  const [profileImageFile, setProfileImageFile] = useState(undefined);
  const [profileImageUrl, setProfileImageUrl] = useState(undefined);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if(finished) {
    return (
      <div className={S("content", "onboard")}>
        <TenantInfo tenantContractId={onboardParams.tenantContractId} />

        <Text mb="lg" fz={16} className={S("header-text")}>
          Your account is now set up.
        </Text>
        <Text mb="xl" px="sm" fz={16} className={S("header-text")}>
          Your administrator has been notified in order to grant appropriate permissions.
        </Text>
        <div className={S("actions")}>
          <Button onClick={() => Close("/profile")} className={S("button")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if(submitting) {
    return (
      <div className={S("content", "onboard")}>
        <TenantInfo tenantContractId={onboardParams.tenantContractId} />
        <Group my="md" justify="center">
          <div className={S("profile-image")}>
            <div className={S("profile-image__image-wrapper")}>
              <div className={S("round-image", "profile-image__image")}>
                <ImageIcon
                  icon={profileImageUrl}
                  alternateIcon={DefaultProfileImage({...accountsStore.currentAccount, name})}
                />
              </div>
            </div>

            <input
              ref={browseRef}
              type="file"
              multiple={false}
              accept="image/*"
              hidden={true}
              onChange={event => {
                const file = event.target.files[0];
                setProfileImageFile(file);

                const reader  = new FileReader();
                reader.onload = event => setProfileImageUrl(event.target.result?.toString());
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </Group>
        <Text fw={500} ta="center" fz={18}>{name}</Text>
        <Group mt={50} mb="sm" justify="center">
          <Loader />
        </Group>
        <Text ta="center" fw={500}>Initializing your account...</Text>
      </div>
    );
  }

  const Submit = async () => {
    try {
      setError(undefined);
      setSubmitting(true);

      await tenantStore.ConsumeInvite({
        ...onboardParams,
        name,
        profileImageFile
      });

      setFinished(true);
    } catch(error) {
      rootStore.Log("Error initializing account:", true);
      rootStore.Log(error, true);

      setError("Unable to complete account setup. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className={S("content", "onboard")}>
      <TenantInfo tenantContractId={onboardParams.tenantContractId} />
      <div className={S("header-text")}>
        Set Up Your Account
      </div>
      <Group my="md" justify="center">
        <div className={S("profile-image")}>
          <div className={S("profile-image__image-wrapper")}>
            <div className={S("round-image", "profile-image__image")}>
              <ImageIcon icon={profileImageUrl} alternateIcon={DefaultProfileIcon} />
            </div>
            <UnstyledButton
              title="Change Profile Image"
              onClick={() => browseRef.current.click()}
              className={S("icon-button", "profile-image__edit")}
            >
              <ImageIcon icon={EditIcon}/>
            </UnstyledButton>
          </div>

          <input
            ref={browseRef}
            type="file"
            multiple={false}
            accept="image/*"
            hidden={true}
            onChange={event => {
              const file = event.target.files[0];
              setProfileImageFile(file);

              const reader  = new FileReader();
              reader.onload = event => setProfileImageUrl(event.target.result?.toString());
              reader.readAsDataURL(file);
            }}
          />
        </div>
      </Group>
      <TextInput
        value={name}
        placeholder="Name"
        onChange={event => setName(event.currentTarget.value)}
        onKeyDown={event => {
          if(event.key !== "Enter") { return; }

          Submit();
        }}
      />
      <div className={S("actions")}>
        <ButtonWithLoader
          loading={submitting}
          disabled={!name}
          onClick={Submit}
          className={S("button")}
        >
          Continue
        </ButtonWithLoader>
      </div>
      {
        !error ? null :
          <Text mt="xl" className={S("error")}>
            {error}
          </Text>
      }
    </div>
  );
});

const LoginModal = observer(({Close}) => {
  const [accountType, setAccountType] = useState("custodial");
  const [closable, setClosable] = useState(true);
  const [showOnboardForm, setShowOnboardForm] = useState(false);

  const onboardParams = rootStore.pathname.startsWith("/onboard") && tenantStore.onboardParams;

  useEffect(() => {
    // Ensure closable is reset when type changes
    setClosable(true);
  }, [accountType]);

  const onLogin = async success => {
    if(!success || !onboardParams) {
      return Close(success);
    }

    if(onboardParams && success) {
      if(
        accountsStore.currentAccount?.tenantContractId === onboardParams.tenantContractId &&
        parseFloat(accountsStore.currentAccount?.balance || 0) > 0.02
      ) {
        // Account was already onboarded to this tenancy and has funds
        Close(true);
      } else {
        setShowOnboardForm(true);
      }
    }
  };

  return (
    <Modal
      centered
      size="sm"
      w={200}
      opened
      onClose={closable && !showOnboardForm ? Close : () => {}}
      withCloseButton={false}
      classNames={{
        overlay: S("modal-overlay"),
      }}
    >
      <div className={S("login-modal")}>
        <div className={S("header")}>
          <img src={EluvioLogo} className={S("header__logo")}/>
          <div className={S("header__title")}>
            Content Fabric
          </div>
        </div>
        {
          showOnboardForm ?
            <OnboardForm onboardParams={onboardParams} Close={Close}/> :
            <LoginModalContent
              onboardParams={onboardParams}
              accountType={accountType}
              setAccountType={setAccountType}
              setClosable={setClosable}
              Close={onLogin}
            />
        }
      </div>
    </Modal>
  );
});

const Login = observer(() => {
  const navigate = useNavigate();

  return (
    <div className={S("page-content", "login-page")}>
      <LoginModal
        Close={success => {
          if(typeof success === "string") {
            navigate(success);
          } else if(success) {
            navigate(accountsStore.currentAccount.lowBalance ? "/profile" : "/apps");
          }
        }}
      />
    </div>
  );
});

export default Login;
