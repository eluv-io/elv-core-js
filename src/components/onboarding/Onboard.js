import "../../static/stylesheets/onboard.scss";
import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {ActionIcon, Button, Paper, PasswordInput, TextInput, Title, Text, Checkbox, Group} from "@mantine/core";
import {accountsStore, rootStore} from "../../stores";
import {useDisclosure} from "@mantine/hooks";
import {ImageIcon} from "elv-components-js";

import DownloadIcon from "../../static/icons/download.svg";

const DownloadMnemonic = mnemonic => {
  const element = document.createElement("a");
  element.href = "data:attachment/text," + encodeURI(mnemonic);
  element.target = "_blank";
  element.download = "mnemonic.txt";
  element.click();
};

// TODO: Get tenant name / branding
const Onboard = observer(() => {
  const [params, setParams] = useState(undefined);
  const [passwordVisible, {toggle}] = useDisclosure(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    passwordConfirmation: "",
    mnemonic: "",
    mnemonicSaved: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    try {
      setParams(JSON.parse(rootStore.utils.FromB58ToStr(searchParams.get("obp"))));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Unable to retrieve onboarding params:");
      // eslint-disable-next-line no-console
      console.error(error);
    }

    setFormData({
      ...formData,
      mnemonic: accountsStore.GenerateMnemonic()
    });
  }, []);

  const valid =
    !!formData.name &&
    !!formData.password &&
    !!formData.passwordConfirmation &&
    formData.password === formData.passwordConfirmation &&
    formData.mnemonicSaved;

  if(!params?.tenantId || !params?.faucetToken) {
    return (
      <div className="page-content">
        <Paper withBorder p="xl" w={800} mt={50} shadow="sm">
          <Title order={4} ta="center" mt="xl" mb="md">Invalid Onboarding URL</Title>
          <Text ta="center" mb="xl">
            Please contact your tenant administrator
          </Text>
        </Paper>
      </div>
    );
  }

  if(complete) {
    return (
      <div className="page-content">
        <Paper withBorder p="xl" w={800} mt={50} shadow="sm">
          <Title order={4} ta="center" mt="xl" mb="md">Account Created</Title>
          <Text ta="center" mb="xl">
            Your tenant administrator will be notified to grant appropriate permissions
          </Text>
        </Paper>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Paper withBorder p="xl" pr={50} w={800} mt={50} shadow="sm">
        <form className="onboard-form">
          <Title order={4} mb="xl">Create Account</Title>
          <TextInput
            mb="md"
            label="Account Name"
            value={formData.name}
            required
            onChange={event => {
              setFormData({...formData, name: event.currentTarget.value});
            }}
          />
          <PasswordInput
            visible={passwordVisible}
            onVisibilityChange={toggle}
            mb="md"
            label="Password"
            description="Password must be at least 6 characters long and must contain at least one uppercase letter, lowercase letter, number and symbol"
            value={formData.password}
            required
            onChange={event => setFormData({...formData, password: event.currentTarget.value})}
            error={formData.password && formData.passwordConfirmation && formData.password !== formData.passwordConfirmation}
          />
          <PasswordInput
            visible={passwordVisible}
            onVisibilityChange={toggle}
            mb="md"
            label="Confirm Password"
            value={formData.passwordConfirmation}
            required
            onChange={event => setFormData({...formData, passwordConfirmation: event.currentTarget.value})}
          />

          <Title order={5} mt="xl">Mnemonic Phrase</Title>
          <Text fz="xs" color="dimmed" mb="sm">
            This mnemonic can be used to recover your account. Please download the mnemonic and ensure it is backed up and kept safe.
          </Text>
          <Paper withBorder p="md" className="mnemonic-container">
            <Text fz="sm" color="dimmed">
              { formData.mnemonic }
            </Text>
            <ActionIcon
              variant="transparent"
              title="Download Mnemonic Phrase"
              aria-label="Download Mnemonic Phrase"
              className="mnemonic-download"
              onClick={() => DownloadMnemonic(formData.mnemonic)}
            >
              <ImageIcon icon={DownloadIcon} />
            </ActionIcon>
          </Paper>
          <Checkbox
            mt="md"
            label="I have saved my mnemonic in a safe, secure place"
            checked={formData.mnemonicSaved}
            onChange={event => setFormData({...formData, mnemonicSaved: event.currentTarget.checked})}
            className="mnemonic-saved"
          />
          <Group mt={50} />
          { !error ? null : <Text mb="md" color="red" ta="center">Something went wrong, please try again</Text> }
          <Group position="right">
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
                    password: formData.password,
                    passwordConfirmation: formData.passwordConfirmation,
                    name: formData.name,
                    faucetToken: params.faucetToken,
                    tenantId: params.tenantId
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

export default Onboard;