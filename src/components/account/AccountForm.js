import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {
  Input as MantineInput,
  Text,
  Group,
  Button,
  Title,
  Select,
  Paper,
  PasswordInput,
  TextInput,
  Textarea,
  ActionIcon
} from "@mantine/core";
import {Link} from "react-router-dom";
import {accountsStore} from "../../stores";
import {Navigate} from "react-router";
import {ImageIcon} from "elv-components-js";
import EditIcon from "../../static/icons/edit.svg";
import DownloadIcon from "../../static/icons/download.svg";

const DownloadMnemonic = mnemonic => {
  const element = document.createElement("a");
  element.href = "data:attachment/text," + encodeURI(mnemonic);
  element.target = "_blank";
  element.download = "mnemonic.txt";
  element.click();
};

const AccountForm = observer(() => {
  const [formData, setFormData] = useState({
    credentialType: "privateKey",
    privateKey: "",
    encryptedPrivateKey: "",
    mnemonic: "",
    password: "",
    passwordConfirmation: ""
  });
  const [error, setError] = useState(undefined);
  const [editingMnemonic, setEditingMnemonic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const valid =
    formData.password &&
    formData.passwordConfirmation &&
    formData.password === formData.passwordConfirmation &&
    (
      (formData.credentialType === "privateKey" && formData.privateKey) ||
      (formData.credentialType === "encryptedPrivateKey" && formData.encryptedPrivateKey) ||
      (formData.credentialType === "mnemonic" && formData.mnemonic)
    );

  if(complete) {
    return <Navigate to="/accounts" />;
  }

  return (
    <div className="page-content">
      <Paper withBorder p="xl" pr={50} shadow="sm" className="form-container">
        <form className="account-form" onSubmit={event => event.preventDefault()}>
          <Title order={4} mb="xl">Create Account</Title>
          <Select
            mb="md"
            label="Credential Type"
            data={[
              {label: "Mnemonic Phrase", value: "mnemonic"},
              {label: "Private Key", value: "privateKey"},
              {label: "Encrypted Private Key", value: "encryptedPrivateKey"},
            ]}
            value={formData.credentialType}
            onChange={value => {
              let mnemonic = "";
              if(value === "mnemonic") {
                mnemonic = accountsStore.GenerateMnemonic();
              }

              setFormData({
                ...formData,
                credentialType: value,
                privateKey: "",
                encryptedPrivateKey: "",
                mnemonic
              });
            }}
          />
          {
            formData.credentialType !== "privateKey" ? null :
              <TextInput
                mb="md"
                label="Private Key"
                value={formData.privateKey}
                onChange={event => setFormData({...formData, privateKey: event.currentTarget.value})}
              />
          }
          {
            formData.credentialType !== "encryptedPrivateKey" ? null :
              <Textarea
                mb="md"
                label="Encrypted Private Key"
                value={formData.encryptedPrivateKey}
                onChange={event => setFormData({...formData, encryptedPrivateKey: event.currentTarget.value})}
              />
          }
          {
            formData.credentialType !== "mnemonic" ? null :
              <MantineInput.Wrapper
                label="Mnemonic Phrase"
                description="This mnemonic can be used to recover your account. Please download the mnemonic and ensure it is backed up and kept safe."
              >
                {
                  editingMnemonic ?
                    <TextInput
                      value={formData.mnemonic}
                      onChange={event => setFormData({...formData, mnemonic: event.currentTarget.value})}
                      placeholder="Mnemonic phrase"
                      mt="sm"
                      mb="md"
                    /> :
                    <Paper withBorder p="md" mt="sm" mb="md" className="mnemonic-container">
                      <Text italic fz="sm">{formData.mnemonic}</Text>
                      <ActionIcon
                        variant="transparent"
                        title="Modify Mnemonic Phrase"
                        aria-label="Modify Mnemonic Phrase"
                        className="mnemonic-edit"
                        onClick={() => setEditingMnemonic(true)}
                      >
                        <ImageIcon icon={EditIcon}/>
                      </ActionIcon>
                      <ActionIcon
                        variant="transparent"
                        title="Download Mnemonic Phrase"
                        aria-label="Download Mnemonic Phrase"
                        className="mnemonic-download"
                        onClick={() => DownloadMnemonic(formData.mnemonic)}
                      >
                        <ImageIcon icon={DownloadIcon}/>
                      </ActionIcon>
                    </Paper>
                }
              </MantineInput.Wrapper>
          }
          <PasswordInput
            mb="md"
            label="Password"
            description="Password must be at least 6 characters long and must contain at least one uppercase letter, lowercase letter, number and symbol"
            value={formData.password}
            onChange={event => setFormData({...formData, password: event.currentTarget.value})}
          />
          <PasswordInput
            mb="md"
            label="Password Confirmation"
            value={formData.passwordConfirmation}
            onChange={event => setFormData({...formData, passwordConfirmation: event.currentTarget.value})}
            error={formData.password && formData.passwordConfirmation && formData.password !== formData.passwordConfirmation}
          />
          <Group mt={50} />
          { !error ? null : <Text mb="md" color="red" ta="center">Something went wrong, please try again</Text> }
          <Group position="right" noWrap>
            <Button
              variant="default"
              type="button"
              component={Link}
              to="/accounts"
              w={150}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!valid}
              opacity={submitting ? 0.5 : 1}
              styles={{
                root: {
                  transition: "opacity 0.25s ease"
                }
              }}
              w={150}
              onClick={async () => {
                if(submitting) { return; }

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

                  setComplete(true);
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error(error);
                  setSubmitting(false);
                  setError(error.toString());
                }
              }}
            >
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
});

export default AccountForm;
