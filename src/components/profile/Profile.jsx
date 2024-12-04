import ProfileStyles from "../../static/stylesheets/modules/profile.module.scss";

import {observer} from "mobx-react";
import {rootStore, accountsStore, tenantStore} from "../../stores";
import React, {useRef, useState} from "react";
import {CreateModuleClassMatcher} from "../../utils/Utils";
import {ButtonWithLoader, CopyButton, DefaultProfileImage, ImageIcon} from "../Misc";


import {Button, Group, Loader, Text, TextInput, Title, UnstyledButton} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import UrlJoin from "url-join";

import EditIcon from "../../static/icons/edit";
import CheckIcon from "../../static/icons/Check";
import XIcon from "../../static/icons/X";
import CaretUpIcon from "../../static/icons/caret-up";
import CaretDownIcon from "../../static/icons/caret-down";
import KeyIcon from "../../static/icons/Key";
import FundsIcon from "../../static/icons/elv-token";
import TenancyIcon from "../../static/icons/users";

const S = CreateModuleClassMatcher(ProfileStyles);

const ProfileImage = observer(() => {
  const browseRef = useRef();
  const [loading, setLoading] = useState(false);

  return (
    <div className={S("profile-image")}>
      <div className={S("profile-image__image-wrapper")}>
        <div className={S("round-image", "profile-image__image")}>
          {
            loading ?
              <div className={S("profile-image__loader")}>
                <Loader color="gray.2" size="xl" />
              </div> :
              <ImageIcon
                icon={accountsStore.currentAccount.imageUrl}
                alternateIcon={DefaultProfileImage(accountsStore.currentAccount)}
              />
          }
        </div>
        <UnstyledButton
          disabled={accountsStore.currentAccount?.lowBalance}
          title="Change Profile Image"
          onClick={() => browseRef.current.click()}
          className={S("icon-button", "profile-image__edit")}
        >
          <ImageIcon icon={EditIcon} />
        </UnstyledButton>
      </div>

      <input
        ref={browseRef}
        type="file"
        multiple={false}
        accept="image/*"
        hidden={true}
        onChange={event => {
          setLoading(true);
          accountsStore.ReplaceUserProfileImage(event.target.files[0])
            .finally(() => setLoading(false));
        }}
      />
    </div>
  );
});

const ProfileName = observer(() => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(accountsStore.currentAccount.name || accountsStore.currentAccount.email || "");
  const [submitting, setSubmitting] = useState(false);

  if(!editing) {
    return (
      <div>
        <Group justify="center" align="center" mt={5} gap={10}>
          <Text mt={5} fz={18} fw={600}>
            {
              accountsStore.currentAccount.name ||
              accountsStore.currentAccount.email ||
              accountsStore.currentAccount.address
            }
          </Text>
          <UnstyledButton
            disabled={accountsStore.currentAccount?.lowBalance}
            onClick={() => setEditing(true)}
            className={S("icon-button")}
          >
            <ImageIcon icon={EditIcon} />
          </UnstyledButton>
        </Group>
        {
          !accountsStore.currentAccount.tenantContractId ? null :
            <Text fz="xs" ta="center" fw={500} pr={20} color="gray.7">{accountsStore.currentAccount.tenantContractId}</Text>
        }
      </div>
    );
  }

  const Submit = async () => {
    setSubmitting(true);

    try {
      if(name !== accountsStore.currentAccount.name) {
        await accountsStore.ReplaceUserMetadata({
          metadataSubtree: UrlJoin("public", "name"),
          metadata: name
        });
      }

      setEditing(false);
    } catch(error) {
      accountsStore.Log(error, true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Group justify="center" mt={5}>
      <TextInput
        w={225}
        ta="center"
        value={name}
        onChange={event => setName(event.target.value)}
        onKeyDown={event => event.key === "Enter" && Submit()}
        ml={60}
        className={S("profile__name-input")}
      />
      <UnstyledButton key="submit" onClick={Submit} className={S("icon-button")}>
        {
          submitting ?
            <Loader size={20} /> :
            <ImageIcon icon={CheckIcon} />
        }
      </UnstyledButton>
      <UnstyledButton disabled={submitting} onClick={() => setEditing(false)} className={S("icon-button")}>
        <ImageIcon icon={XIcon} />
      </UnstyledButton>
    </Group>
  );
});

const PrivateKeyDetails = observer(() => {
  const [show, setShow] = useState(false);

  if(accountsStore.currentAccount?.type !== "key") {
    return null;
  }

  const publicKey = rootStore.client.utils.AddressToHash(rootStore.client.signer._signingKey().publicKey, true)

  return (
    <div className={S("key")}>
      <UnstyledButton onClick={() => setShow(!show)} className={S("icon-button", "key__toggle")}>
        <ImageIcon icon={KeyIcon} />
      </UnstyledButton>
      {
        !show ? null :
          <div className={S("key__details")}>
            <Group justify="center" h={25}>
              <Text fw={500} fz={12}>
                Private Key:
              </Text>
              <Text fz={12}>
                { rootStore.client.signer.privateKey }
              </Text>
              <CopyButton value={rootStore.client.signer.privateKey} className={S("icon-button", "key__copy")} />
            </Group>
            <Group justify="center" h={25}>
              <Text fw={500} fz={12}>
                Public Key:
              </Text>
              <Text fz={8}>
                {`kupk${publicKey}`}
              </Text>
              <CopyButton value={publicKey} className={S("icon-button", "key__copy")} />
            </Group>
          </div>
      }
    </div>
  );
});

const TenantInfo = observer(() => {
  if(
    !tenantStore.publicTenantMetadata ||
    !tenantStore.publicTenantMetadata.name ||
    tenantStore.publicTenantMetadata.name?.startsWith("iq__")
  ) {
    return null;
  }

  return (
    <div key={accountsStore.currentAccount?.tenantContractId} className={S("tenant__info")}>
      <div className={S("tenant-image", "tenant__image")}>
        <ImageIcon
          icon={tenantStore.publicTenantMetadata.image?.url || TenancyIcon}
          alternateIcon={TenancyIcon}
        />
      </div>
      <div className={S("tenant__text")}>
        <Title fw={500} order={3} mb={5} className={S("tenant-info__title")}>
          {tenantStore.publicTenantMetadata.name}
        </Title>
        <div className={S("tenant__description")}>
          { tenantStore.publicTenantMetadata.description || "" }
        </div>
      </div>
    </div>
  );
});

const TenantDetails = observer(() => {
  const [tenantContractId, setTenantContractId] = useState(accountsStore.currentAccount.tenantContractId || "");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className={S("profile__content-block", "tenant")}>
      <div className={S("tenant__content")}>
        <Text mb="md" fz={20} fw={500}>Tenant Information</Text>
        <Group mb="sm" gap={10}>
          <TextInput fz={12} placeholder="Tenant Contract ID" value={tenantContractId} onChange={event => setTenantContractId(event.target.value)} className={S("tenant__input", "tenant__input--contract")} />
          <ButtonWithLoader
            variant="outline"
            h={50}
            w={175}
            disabled={accountsStore.currentAccount?.lowBalance || !tenantContractId || tenantContractId === accountsStore.currentAccount.tenantContractId}
            onClick={async () => {
              setErrorMessage("");

              try {
                await accountsStore.SetTenantContractId({id: tenantContractId});
              } catch(error) {
                accountsStore.Log(error, true);
                setErrorMessage("Unable to update tenant ID");
              }
            }}
          >
            Set Tenant ID
          </ButtonWithLoader>
        </Group>
        {
          !errorMessage ? null :
            <Text mt="md" fz={14} fw={500} className={S("tenant__error", "error")}>
              { errorMessage }
            </Text>
        }
        <TenantInfo />
      </div>
    </div>
  );
});

const AccountMetadata = observer(() => {
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <div className={S("profile__content-block", "profile-metadata")}>
      <Text mb="md" fz={20} fw={500}>Profile Information</Text>
      <Button w={200} variant="outline" color="gray.6" onClick={() => setShowMetadata(!showMetadata)}>
        { showMetadata ? "Hide Profile Metadata" : "Show Profile Metadata" }
      </Button>
      {
        !showMetadata ? null :
          <pre className={S("profile-metadata__metadata")}>
            {
              JSON.stringify(
                accountsStore.currentAccount.metadata,
                null,
                2
              )
            }
          </pre>
      }
    </div>
  );
});

const AdvancedDetails = observer(() => {
  return (
    <>
      <div className={S("profile__content-block")}>
        <Text fz={20} fw={500}>Total Balance</Text>
        <Group justify="center" gap={3} mt={5}>
          <ImageIcon icon={FundsIcon} className={S("icon")} />
          <Text fz={20}>{accountsStore.currentAccount.balance || "0.0"}</Text>
        </Group>
        <TenantDetails />
        <AccountMetadata />
      </div>
    </>
  );
});

const Profile = observer(() => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if(!accountsStore.currentAccount) {
    return null;
  }

  return (
    <div className="page-content">
      <Group justify="center" mb="xs">
        <ProfileImage />
      </Group>
      <Group justify="center" mb="xl">
        <ProfileName />
      </Group>
      <div className={S("profile")}>
        <div className={S("header-text", "profile__header")}>
          Account Details
        </div>

        <div className={S("profile__content-block")}>
          <Text mt="md" mb="sm" fz={20} fw={500}>Eluvio Content Blockchain Address</Text>
          <Group gap="md" justify="center">
            <Text fw={500} fz={16} className={S("profile__address")}>
              {accountsStore.currentAccount.address}
            </Text>
            <CopyButton
              value={accountsStore.currentAccount.address}
              title="Copy Account Address"
              className={S("icon-button")}
            />
          </Group>
          <Text fz={10} fw={500} mt="sm" className={S("profile__funds-warning")}>
            Do not send funds to this address. This is an Eluvio Content Blockchain Address and is not a payment
            address.
          </Text>
        </div>
        <div className={S("profile__content-block")}>
          <Text fw={500} fz={20}>Signed in as</Text>
          <Text mt={5} fz={18}>
            {
              accountsStore.currentAccount.email ||
              accountsStore.currentAccount.name ||
              accountsStore.currentAccount.address
            }
          </Text>
          <Group justify="center" mt="md">
            {
              !tenantStore.isTenantAdmin ? null :
                <Button onClick={() => navigate("/tenancy")}>
                  Manage Tenancy
                </Button>
            }
            <ButtonWithLoader
              variant="outline"
              w={150}
              to="/accounts"
              onClick={async () => {
                accountsStore.LockAccount({address: accountsStore.currentAccountAddress});
                navigate("/accounts");
              }}
            >
              Sign Out
            </ButtonWithLoader>
          </Group>

          <PrivateKeyDetails />
        </div>

        <Group justify="center" mb="md" mt="md">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className={S("profile__advanced-toggle")}>
            <span>Advanced Details</span>
            <ImageIcon icon={showAdvanced ? CaretUpIcon : CaretDownIcon} />
          </button>
        </Group>

        {
          !showAdvanced ? null :
            <AdvancedDetails />
        }
      </div>
    </div>
  );
});

export default Profile;
