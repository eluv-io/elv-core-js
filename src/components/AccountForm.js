import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Input as MantineInput, Text, Group, Button, Title, Select, Paper, PasswordInput, TextInput, Textarea} from "@mantine/core";
import {Link} from "react-router-dom";
import {accountsStore} from "../stores";
import {Navigate} from "react-router";

const AccountForm = observer(() => {
  const [formData, setFormData] = useState({
    credentialType: "mnemonic",
    privateKey: "",
    encryptedPrivateKey: "",
    mnemonic: "",
    password: "",
    passwordConfirmation: ""
  });
  const [error, setError] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setFormData({...formData, mnemonic: accountsStore.GenerateMnemonic()});
  }, []);

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
      <Paper withBorder p="xl" pr={50} w={800} mt="xl" shadow="sm">
        <form className="account-form" onSubmit={() => {}}>
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
                <Paper withBorder p="md" mt="sm" mb="md">
                  <Text italic fz="sm">{formData.mnemonic}</Text>
                </Paper>
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
          <Group position="right">
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
              disabled={!valid}
              loading={submitting}
              type="button"
              w={150}
              onClick={async () => {
                setSubmitting(true);
                setError(undefined);

                try {
                  await accountsStore.AddAccount({
                    mnemonic: formData.mnemonic,
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
