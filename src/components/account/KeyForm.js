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
  UnstyledButton
} from "@mantine/core";
import {accountsStore} from "../../stores";
import EditIcon from "../../static/icons/edit.svg";
import DownloadIcon from "../../static/icons/download.svg";
import {CreateModuleClassMatcher} from "../../utils/Utils";
import {ImageIcon} from "../Misc";

const S = CreateModuleClassMatcher(LoginStyles);

const DownloadMnemonic = mnemonic => {
  const element = document.createElement("a");
  element.href = "data:attachment/text," + encodeURI(mnemonic);
  element.target = "_blank";
  element.download = "mnemonic.txt";
  element.click();
};

const KeyForm = observer(({onboardParams, UpdateFormData}) => {
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
    UpdateFormData?.({
      ...formData,
      valid: !!(
        formData.password &&
        formData.passwordConfirmation &&
        formData.password === formData.passwordConfirmation &&
        (
          (formData.credentialType === "privateKey" && formData.privateKey) ||
          (formData.credentialType === "encryptedPrivateKey" && formData.encryptedPrivateKey) ||
          (formData.credentialType === "mnemonic" && formData.mnemonic)
        )
      )
    });
  }, [formData]);

  return (
    <form className={S("account-form")} onSubmit={event => event.preventDefault()}>
      <Select
        aria-label="Credential Type"
        data={[
          {label: "Mnemonic Phrase", value: "mnemonic"},
          {label: "Private Key", value: "privateKey"},
          {label: "Encrypted Private Key", value: "encryptedPrivateKey"},
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
        classNames={{input: S("input")}}
      />
      {
        formData.credentialType !== "privateKey" ? null :
          <TextInput
            aria-label="Private Key"
            placeholder="Private Key"
            value={formData.privateKey}
            onChange={event => setFormData({...formData, privateKey: event.currentTarget.value})}
            className={S("input__fz-xs")}
          />
      }
      {
        formData.credentialType !== "encryptedPrivateKey" ? null :
          <Textarea
            aria-label="Encrypted Private Key"
            placeholder="Encrypted Private Key"
            value={formData.encryptedPrivateKey}
            minRows={5}
            autosize
            onChange={event => setFormData({...formData, encryptedPrivateKey: event.currentTarget.value})}
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
      />
      <PasswordInput
        aria-label="Password Confirmation"
        placeholder="Password Confirmation"
        value={formData.passwordConfirmation}
        onChange={event => setFormData({...formData, passwordConfirmation: event.currentTarget.value})}
        error={formData.password && formData.passwordConfirmation && formData.password !== formData.passwordConfirmation}
      />
    </form>
  );
});

export default KeyForm;

