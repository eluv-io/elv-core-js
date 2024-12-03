import TenantStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {
  Button,
  Paper,
  TextInput,
  Title,
  Text,
  Group,
  UnstyledButton,
  Textarea,
  Loader,
} from "@mantine/core";
import {rootStore, accountsStore, tenantStore} from "../../stores";
import {ImageIcon} from "../Misc";
import {CreateModuleClassMatcher, JoinClassNames} from "../../utils/Utils";

import TenancyIcon from "../../static/icons/users";
import EditIcon from "../../static/icons/edit.svg";
import FundsIcon from "../../static/icons/elv-token";

const S = CreateModuleClassMatcher(TenantStyles);

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
    <div className={S("tenant-page")}>
      <div className={JoinClassNames("form-container", S("tenant-form"))}>
        <form onSubmit={event => event.preventDefault()} className={S("left-input")}>
          <div className="form-header">
            Manage Tenancy Info
          </div>
          <div className="form-content">
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
            <Group justify="center">
              <UnstyledButton
                type="button"
                aria-label="Set Tenant Image"
                onClick={() => fileInputRef?.current.click()}
                className={S("tenant-image", "tenant-form__image")}
              >
                <div className={S("tenant-image")}>
                  <ImageIcon
                    label="Tenant Image"
                    icon={tenantInfo.newImageUrl || tenantStore.publicTenantMetadata.image?.url || TenancyIcon}
                    alternateIcon={TenancyIcon}
                  />
                </div>
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
            <Group justify="right" mt={50} gap={10}>
              <Button h={40} w={150} variant="default" onClick={() => Back()}>Cancel</Button>
              <Button
                h={40}
                w={150}
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

                    rootStore.SetToastMessage("Tenant information successfully updated");

                    Back();
                  } catch (error) {
                    tenantStore.Log(error, true);
                    setSubmitting(false);
                  }
                }}
              >
                Submit
              </Button>
            </Group>
          </div>
        </form>
      </div>
    </div>
  );
});

const TenantOverview = observer(() => {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    tenantStore.LoadPublicTenantMetadata();
    tenantStore.LoadTenantFundingAccount({tenantContractId: accountsStore.currentAccount.tenantContractId});
  }, [accountsStore.currentAccount.tenantContractId]);

  if(editing) {
    return <TenantForm key={`tenant-form-${accountsStore.currentAccount.tenantContractId}`} Back={() => setEditing(false)} />;
  }

  if(!tenantStore.publicTenantMetadata) {
    return <Loader className={S("page-loader")} />;
  }

  return (
    <div className={S("tenant-page")}>
      <div className={S("header-text", "tenant-page__header")}>Overview</div>

      <Paper
        withBorder
        p="xl"
        pr={60}
        w={800}
        className={S("tenant-overview")}
      >
        {
          !tenantStore.isTenantAdmin ? null :
            <UnstyledButton
              onClick={() => setEditing(true)}
              title="Edit Tenancy Info"
              className={S("icon-button", "tenant-overview__edit")}
            >
              <ImageIcon label="Edit" icon={EditIcon}/>
            </UnstyledButton>
        }
        <Group wrap="nowrap" gap="xl" align="top">
          <div className={S("tenant-image", "tenant-overview__image")}>
            <ImageIcon
              label="Tenant Image"
              icon={tenantStore.publicTenantMetadata.image?.url || TenancyIcon}
              alternateIcon={TenancyIcon}
            />
          </div>
          <div>
            <Title fw={500} order={3}>{tenantStore.publicTenantMetadata.name || "Tenant"}</Title>
            <Text fz="xs" mb="sm" className={S("tenant-overview__tenant-id")}>{tenantStore.tenantContractId}</Text>
            <Text fz="sm" className={S("tenant-overview__description")}>
              {tenantStore.publicTenantMetadata.description}
            </Text>
          </div>
        </Group>
      </Paper>

      {
        !tenantStore.tenantFundingAccount ? null :
          <Paper
            withBorder
            p="md"
            pr={60}
            w={350}
            mt="md"
            className={S("tenant-overview")}
          >
            <Title fw={500} order={4}>Tenant Funds</Title>
            <Text fz={12}>{tenantStore.tenantFundingAccount.tenant_funding_address}</Text>
            <Group gap={5} mt="sm">
              <ImageIcon label="Funds Icon" icon={FundsIcon} className={S("icon")} />
              <Text fz={14}>{tenantStore.tenantFunds?.toFixed(2)}</Text>
            </Group>
          </Paper>
      }
    </div>
  );
});

export default TenantOverview;
