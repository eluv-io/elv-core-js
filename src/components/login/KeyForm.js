import LoginStyles from "../../static/stylesheets/modules/login.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {
  Input as MantineInput,
  Text,
  Group,
  Select,
  Paper,
  PasswordInput,
  TextInput,
  Textarea,
  Loader,
  UnstyledButton, Button
} from "@mantine/core";
import {rootStore, accountsStore} from "../../stores";
import EditIcon from "../../static/icons/edit.svg";
import DownloadIcon from "../../static/icons/download.svg";
import {CreateModuleClassMatcher} from "../../utils/Utils";
import {ImageIcon} from "../Misc";
import {Link} from "react-router-dom";

const S = CreateModuleClassMatcher(LoginStyles);

const DownloadMnemonic = mnemonic => {
  const element = document.createElement("a");
  element.href = "data:attachment/text," + encodeURI(mnemonic);
  element.target = "_blank";
  element.download = "mnemonic.txt";
  element.click();
};

const KeyAccountForm = observer(({onboardParams, Close}) => {
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editingMnemonic, setEditingMnemonic] = useState(false);
  const [formData, setFormData] = useState({
    credentialType: onboardParams ? "mnemonic" : "privateKey",
    privateKey: "",
    encryptedPrivateKey: "",
    mnemonic: "",
    password: "",
    passwordConfirmation: ""
  });

  // Generating a mnemonic causes the UI to stutter a bit. Delay it until after initial render
  useEffect(() => {
    if(formData.mnemonic || formData.credentialType !== "mnemonic") {
      return;
    }

    setTimeout(() => {
      setFormData({
        ...formData,
        mnemonic: accountsStore.GenerateMnemonic()
      });
    }, 10);
  }, [formData.credentialType]);

  useEffect(() => {
    setEditingMnemonic(false);
  }, [formData.credentialType]);

  useEffect(() => {
    setError(undefined);
  }, [formData]);

  const Submit = async () => {
    const passwordError = accountsStore.TestPassword(formData.password);

    if(passwordError) {
      setError(passwordError);
      return;
    }

    setSubmitting(true);
    setError(undefined);

    // Determine private key and bare encrypted key for whichever credential type is provided
    try {
      let privateKey = formData.privateKey.trim();
      let encryptedPrivateKey = formData.encryptedPrivateKey.trim();

      if(formData.credentialType === "mnemonic") {
        // Mnemonic
        privateKey = await accountsStore.DecryptKey({mnemonic: formData.mnemonic.trim(), password: formData.password});
        encryptedPrivateKey = await accountsStore.EncryptKey({privateKey, password: formData.password});
      } else if(privateKey.startsWith("0x")) {
        // Private key
        encryptedPrivateKey = await accountsStore.EncryptKey({privateKey, password: formData.password});
      } else {
        // Encrypted key
        if(privateKey.startsWith("enc")) {
          encryptedPrivateKey = rootStore.client.utils.FromB58ToStr(privateKey.slice(3));
        } else {
          encryptedPrivateKey = privateKey;
        }

        privateKey = await accountsStore.DecryptKey({encryptedPrivateKey, password: formData.password});
      }

      // Convert to encoded format
      encryptedPrivateKey = `enc${rootStore.client.utils.B58(encryptedPrivateKey)}`;

      setFormData({
        ...formData,
        privateKey,
        encryptedPrivateKey
      });

      setConfirming(true);
    } catch (error) {
      rootStore.Log(error, true);
      setError("Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const Confirm = async () => {
    if(formData.password !== formData.passwordConfirmation) { return; }

    try {
      setSubmitting(true);
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
      rootStore.Log(error, true);
      setError(error.toString());
      setSubmitting(false);
    }
  };

  const valid = formData.password &&
    (
      (formData.credentialType === "privateKey" && formData.privateKey) ||
      (formData.credentialType === "mnemonic" && formData.mnemonic)
    );

  const HandleEnterPressed = event => {
    if(!valid || event.key !== "Enter") { return; }

    confirming ? Confirm() : Submit();
  };

  if(confirming) {
    return (
      <form autoComplete="on" className={S("account-form")} onSubmit={event => event.preventDefault()}>
        <TextInput
          aria-label="Username"
          placeholder="Username"
          name="username"
          disabled
          autoComplete="username"
          description="Please confirm your password to proceed"
          value={formData.encryptedPrivateKey}
          className={S("input__fz-xs")}
        />
        <PasswordInput
          aria-label="Password"
          placeholder="Password"
          autoComplete="current-password"
          value={formData.passwordConfirmation}
          onChange={event => setFormData({...formData, passwordConfirmation: event.currentTarget.value})}
          onKeyDown={event => HandleEnterPressed(event)}
        />
        <div className={S("actions")}>
          <Button
            disabled={formData.password !== formData.passwordConfirmation}
            w="100%"
            loading={submitting}
            className={S("button")}
            onClick={Confirm}
          >
            Sign In
          </Button>
          <Button
            w="100%"
            className={S("button")}
            variant="outline"
            onClick={() => {
              setConfirming(false);
              setFormData({
                ...formData,
                passwordConfirmation: ""
              });
            }}
          >
            Back
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
      </form>
    );
  }

  return (
    <form className={S("account-form")} onSubmit={event => event.preventDefault()}>
      <Select
        aria-label="Credential Type"
        data={[
          {label: "Mnemonic Phrase", value: "mnemonic"},
          {label: "Private Key", value: "privateKey"},
        ]}
        value={formData.credentialType}
        onChange={value => {
          setFormData({
            ...formData,
            credentialType: value || formData.credentialType,
            privateKey: "",
            encryptedPrivateKey: "",
          });
        }}
      />
      {
        formData.credentialType !== "privateKey" ? null :
          <TextInput
            aria-label="Private Key"
            placeholder="Private Key"
            name="username"
            value={formData.privateKey}
            onChange={event => setFormData({
              ...formData,
              privateKey: event.currentTarget.value,
            })}
            onKeyDown={event => HandleEnterPressed(event)}
            className={S("input__fz-xs")}
          />
      }
      {
        formData.credentialType !== "mnemonic" ? null :
          <MantineInput.Wrapper
            aria-label="Mnemonic Phrase"
            placeholder="Mnemonic Phrase"
            maw="100%"
            description="This mnemonic can be used to recover your account. Please download the mnemonic and ensure it is backed up and kept safe."
          >
            {
              editingMnemonic ?
                <Textarea
                  autosize
                  minRows={4}
                  value={formData.mnemonic}
                  onChange={event => setFormData({...formData, mnemonic: event.currentTarget.value})}
                  placeholder="Mnemonic phrase"
                  mt="sm"
                /> :
                <Paper withBorder p="md" mt="sm" className={S("mnemonic")}>
                  <Group wrap="nowrap" gap={5}>
                    <Text fz="sm" className={S("mnemonic__text")}>{formData.mnemonic}</Text>
                    {
                      !formData.mnemonic ?
                        <Group justify="center" w="100%"><Loader /></Group> :
                        <div className={S("mnemonic__actions")}>
                          <UnstyledButton
                            title="Modify Mnemonic Phrase"
                            aria-label="Modify Mnemonic Phrase"
                            className={S("icon-button", "mnemonic__action")}
                            onClick={() => setEditingMnemonic(true)}
                          >
                            <ImageIcon icon={EditIcon}/>
                          </UnstyledButton>
                          <UnstyledButton
                            title="Download Mnemonic Phrase"
                            aria-label="Download Mnemonic Phrase"
                            className={S("icon-button", "mnemonic__action")}
                            onClick={() => DownloadMnemonic(formData.mnemonic)}
                          >
                            <ImageIcon icon={DownloadIcon}/>
                          </UnstyledButton>
                        </div>
                    }
                  </Group>
                </Paper>
            }
          </MantineInput.Wrapper>
      }
      <PasswordInput
        aria-label="Password"
        placeholder="Password"
        description="Password must be at least 6 characters long and must contain at least one uppercase letter, lowercase letter, number and symbol"
        value={formData.password}
        onChange={event => setFormData({...formData, password: event.currentTarget.value})}
        onKeyDown={event => HandleEnterPressed(event)}
      />
      <div className={S("actions")}>
        <Button
          disabled={!valid}
          w="100%"
          loading={submitting}
          className={S("button")}
          onClick={Submit}
        >
          Continue
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
    </form>
  );
});

export default KeyAccountForm;

