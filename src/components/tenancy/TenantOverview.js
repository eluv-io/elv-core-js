import "../../static/stylesheets/onboard.scss";
import React, {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {
  ActionIcon,
  Button,
  Paper,
  TextInput,
  Title,
  Text,
  Group,
  Image,
  UnstyledButton,
  Textarea,
} from "@mantine/core";
import {accountsStore, tenantStore} from "../../stores";
import { ImageIcon, LoadingElement} from "elv-components-js";

import EditIcon from "../../static/icons/edit.svg";

const TenantForm = observer(({Back}) => {
  const fileInputRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const [tenantInfo, setTenantInfo] = useState({
    name: tenantStore.publicTenantMetadata.name || "",
    description: tenantStore.publicTenantMetadata.description || "",
    image: tenantStore.publicTenantMetadata.image,
    newImage: undefined,
    newImageUrl: undefined
  });

  return (
    <div className="page-content">
      <Paper withBorder p="xl" w={800} shadow="sm">
        <Title mb={50} order={3} fw={500} ta="center">Edit Tenancy Info</Title>
        <form onSubmit={() => {}}>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={async event => {
              const file = event.target.files[0];
              setTenantInfo({...tenantInfo, newImage: file});

              const reader = new FileReader();
              reader.onload = event => setTenantInfo({
                ...tenantInfo,
                newImage: file,
                newImageUrl: event.target.result
              });

              reader.readAsDataURL(file);
            }}
          />
          <Group position="center">
            <UnstyledButton type="button" onClick={() => fileInputRef?.current.click()}>
              <Image
                radius="sm"
                withPlaceholder
                width={300}
                height={300}
                src={tenantInfo.newImageUrl || tenantStore.publicTenantMetadata.image?.url}
              />
            </UnstyledButton>
          </Group>
          <TextInput
            my="md"
            label="Tenant Name"
            value={tenantInfo.name}
            required
            onChange={event => {
              setTenantInfo({...tenantInfo, name: event.currentTarget.value});
            }}
          />
          <Textarea
            mb="md"
            label="Description"
            value={tenantInfo.description}
            onChange={event => {
              setTenantInfo({...tenantInfo, description: event.currentTarget.value});
            }}
          />
          <Group position="right" mt={50}>
            <Button variant="default" onClick={() => Back()}>Cancel</Button>
            <Button
              disabled={!tenantInfo.name}
              loading={submitting}
              onClick={async () => {
                setSubmitting(true);

                try {
                  await tenantStore.UpdateTenantInfo({
                    name: tenantInfo.name,
                    description: tenantInfo.description,
                    image: tenantInfo.newImage
                  });

                  Back();
                } catch (error) {
                  setSubmitting(false);
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

const TenantOverview = observer(() => {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    tenantStore.LoadPublicTenantMetadata();
  }, [accountsStore.currentAccount.tenantContractId]);

  if(editing) {
    return <TenantForm Back={() => setEditing(false)} />;
  }

  return (
    <LoadingElement
      fullPage
      loading={!tenantStore.publicTenantMetadata}
      render={() =>
        <div className="page-content">
          <Paper withBorder p="xl" pr={60} w={800} style={{position: "relative"}}>
            {
              !tenantStore.isTenantAdmin ? null :
                <ActionIcon
                  onClick={() => setEditing(true)}
                  title="Edit Tenancy Info"
                  color="blue.5"
                  variant="transparent"
                  style={{
                    position: "absolute",
                    right: "1.5rem",
                    top: "1.5rem"
                  }}
                >
                  <ImageIcon icon={EditIcon} />
                </ActionIcon>
            }
            <Group noWrap spacing="xl" align="top">
              <Group position="center">
                <Image
                  radius="sm"
                  withPlaceholder
                  width={200}
                  height={200}
                  src={tenantStore.publicTenantMetadata.image?.url}
                />
              </Group>
              <div>
                <Title mb="sm" fw={500} order={4}>{tenantStore.publicTenantMetadata.name}</Title>
                <Text fz="sm" color="dimmed">{tenantStore.publicTenantMetadata.description}</Text>
              </div>
            </Group>
          </Paper>
        </div>
      }
    />
  );
});

export default TenantOverview;
