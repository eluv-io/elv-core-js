import "../../static/stylesheets/onboard.scss";
import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {
  Input as MantineInput,
  ActionIcon,
  Button,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Checkbox,
  Group,
  Image
} from "@mantine/core";
import {accountsStore, rootStore, tenantStore} from "../../stores";
import {useDisclosure} from "@mantine/hooks";
import {ImageIcon, LoadingElement} from "elv-components-js";

import DownloadIcon from "../../static/icons/download.svg";

const DownloadMnemonic = mnemonic => {
  const element = document.createElement("a");
  element.href = "data:attachment/text," + encodeURI(mnemonic);
  element.target = "_blank";
  element.download = "mnemonic.txt";
  element.click();
};

const TenantInfo = observer(({tenantContractId}) => {
  useEffect(() => {
    tenantStore.LoadPublicTenantMetadata({tenantContractId});
  }, [tenantContractId]);

  const tenantMetadata = tenantStore.tenantMetadata[tenantContractId]?.public;

  return (
    <LoadingElement
      fullPage
      loading={!tenantMetadata}
      render={() =>
        <Paper withBorder p="xl" pr={60} style={{position: "relative"}} className="content-container tenant-info">
          <Group noWrap spacing="xl" align="top" className="tenant-info__group">
            <Image
              radius="sm"
              withPlaceholder
              width={200}
              miw={200}
              height={200}
              src={tenantMetadata.image?.url}
              className="tenant-info__image"
            />
            <div>
              <Title mb="sm" fw={500} order={3} className="tenant-info__title">{tenantMetadata.name}</Title>
              <Text fz="sm" color="dimmed" className="pre-wrap">{tenantMetadata.description}</Text>
            </div>
          </Group>
        </Paper>
      }
    />
  );
});

// TODO: Get tenant name / branding
const Onboard = observer(() => {
  const [params, setParams] = useState({
    id: "",
    name: "",
    adminAddress: "",
    tenantContractId: "",
    faucetToken: ""
  });
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
      const params = JSON.parse(rootStore.utils.FromB58ToStr(searchParams.get("obp")));

      setParams(params);
      setFormData({
        ...formData,
        mnemonic: accountsStore.GenerateMnemonic(),
        name: params?.name || ""
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Unable to retrieve onboarding params:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, []);

  const valid =
    !!formData.name &&
    !!formData.password &&
    !!formData.passwordConfirmation &&
    formData.password === formData.passwordConfirmation &&
    formData.mnemonicSaved;

  if(!params?.tenantContractId || !params?.faucetToken || !params.adminAddress || !params.id) {
    return (
      <div className="page-content onboard">
        <Paper withBorder p="xl" w={800} shadow="sm">
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
      <div className="page-content onboard">
        <Paper withBorder p="xl" shadow="sm" className="form-container">
          <Title order={4} ta="center" mt="xl" mb="md">Account Created</Title>
          <Text ta="center" mb="xl">
            Your tenant administrator will be notified to grant appropriate permissions
          </Text>
        </Paper>
      </div>
    );
  }

  return (
    <div className="page-content onboard">
      <Paper withBorder p="xl" pr={50} mb={50} shadow="sm" className="content-container">
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
          <MantineInput.Wrapper
            label="Mnemonic Phrase"
            description="This mnemonic can be used to recover your account. Please download the mnemonic and ensure it is backed up and kept safe."
          >
            <Paper withBorder p="md" mt="sm" mb="md" className="mnemonic-container">
              <Text italic fz="sm">{formData.mnemonic}</Text>
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
          </MantineInput.Wrapper>
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
                    tenantContractId: params.tenantContractId,
                    inviteId: params.id,
                    adminAddress: params.adminAddress
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
      <TenantInfo tenantContractId={params.tenantContractId} />
    </div>
  );
});

export default Onboard;
