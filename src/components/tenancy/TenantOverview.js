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
      <Paper withBorder p="xl" shadow="sm" mb="xl" className="form-container">
        <Title mb="xl" order={3} fw={500} ta="center">Edit Tenancy Info</Title>
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
                width={250}
                height={250}
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
            minRows={5}
            autosize
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
    return <TenantForm key={`tenant-form-${accountsStore.currentAccount.tenantContractId}`} Back={() => setEditing(false)} />;
  }

  return (
    <LoadingElement
      fullPage
      loading={!tenantStore.publicTenantMetadata}
      render={() =>
        <div className="page-content">
          <Paper withBorder p="xl" pr={60} style={{position: "relative"}} className="content-container tenant-info">
            {
              !tenantStore.isTenantAdmin ? null :
                <ActionIcon
                  onClick={() => setEditing(true)}
                  title="Edit Tenancy Info"
                  color="blue.5"
                  variant="transparent"
                  className="tenant-info__edit"
                >
                  <ImageIcon icon={EditIcon} />
                </ActionIcon>
            }
            <Group noWrap spacing="xl" align="top" className="tenant-info__group">
              <Image
                radius="sm"
                withPlaceholder
                width={200}
                height={200}
                miw={200}
                src={tenantStore.publicTenantMetadata.image?.url}
                className="tenant-info__image"
              />
              <div>
                <Title mb="sm" fw={500} order={3} className="tenant-info__title">{tenantStore.publicTenantMetadata.name}</Title>
                <Text fz="sm" color="dimmed" className="pre-wrap">{tenantStore.publicTenantMetadata.description}</Text>
              </div>
            </Group>
          </Paper>
        </div>
      }
    />
  );
});

export default TenantOverview;
