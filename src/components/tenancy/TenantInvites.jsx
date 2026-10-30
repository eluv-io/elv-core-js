import TenancyStyles from "@/assets/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, Group, Text, Button, Loader, UnstyledButton, TextInput, Stack} from "@mantine/core";
import TenantInviteModal from "@/components/tenancy/TenantInviteModal";

import {tenantStore} from "@/stores";
import TenantUserPermissionsModal from "@/components/tenancy/TenantUserPermissionsModal";
import {CreateModuleClassMatcher, Sort} from "@/utils/Utils";
import {CopyableField, DefaultProfileImage, ImageIcon} from "@/components/Misc";
import {useDebouncedValue} from "@mantine/hooks";
import {modals} from "@mantine/modals";

import XIcon from "@/assets/icons/X.svg";
import SearchIcon from "@/assets/icons/search.svg";
import DataTable from "@/components/common/DataTable.jsx";

const S = CreateModuleClassMatcher(TenancyStyles);

const TenantInvites = observer(() => {
  const [tab, setTab] = useState(tenantStore.INVITE_EVENTS.ACCEPTED);
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "createdAt", direction: "desc"});
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(undefined);

  useEffect(() => {
    tenantStore.LoadManagedGroups();
    tenantStore.LoadInviteNotifications();
    tenantStore.LoadTenantFundingAccount();
  }, []);

  const invites = tenantStore.Invites(tab)
    .map(invite => ({
      ...invite,
      id: invite?.data?.id,
      address: invite?.data?.address,
      user: tenantStore.users[invite?.data?.address] || {},
      name: tenantStore.users[invite?.data?.address]?.name || invite?.data?.name || invite?.data?.address,
      createdAt: invite.created,
      createdAtString: new Date(invite.created * 1000).toLocaleString()
    }))
    .filter(invite =>
      !debouncedFilter ||
      invite?.name?.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
      invite?.address?.toLowerCase().includes(debouncedFilter.toLowerCase())
    );

  const emptyTabDescriptions = {
    [tenantStore.INVITE_EVENTS.SENT]: "No pending invites",
    [tenantStore.INVITE_EVENTS.ACCEPTED]: "No new accepted invites",
    [tenantStore.INVITE_EVENTS.MANAGED]: "No completed invites"
  };

  const canInvite = (
    tenantStore.specialGroups.tenantUsers?.isOwner ||
    tenantStore.specialGroups.tenantUsers?.isManager
  );

  if(!tenantStore.invites) {
    return <Loader className={S("page-loader")} />;
  }

  const selectedInvite = !showPermissionsModal ? null :
    invites.find(invite => invite.id === showPermissionsModal);

  return (
    <div className={S("tenant-page")}>
      {
        !showInviteModal ? null :
          <TenantInviteModal
            existingInviteId={typeof showInviteModal === "string" ? showInviteModal : undefined}
            Close={() => setShowInviteModal(false)}
          />
      }
      {
        !selectedInvite ? null :
          <TenantUserPermissionsModal
            address={selectedInvite.address}
            inviteId={selectedInvite.id}
            Close={() => setShowPermissionsModal(false)}
          />
      }

      <div className={S("header-text", "tenant-page__header")}>User Invitations</div>
      <Group justify="space-between" maw={1200}>
        <TextInput
          leftSection={<ImageIcon icon={SearchIcon} className={S("search-icon")} />}
          leftSectionWidth={40}
          aria-label="Filter Users"
          value={filter}
          onChange={event => setFilter(event.target.value)}
          placeholder="Filter Users"
          className={S("tenant-users__filter")}
          mb="md"
          maw={400}
          w={400}
        />
        {
          !canInvite ? null :
            <Button w={150} onClick={() => setShowInviteModal(true)}>Invite</Button>
        }
      </Group>
      <Group align="center" gap={30} w="100%" maw={1200} mb="md">
        <Tabs w="100%" maw={1200} color="blue.6" value={tab} onChange={newTab => setTab(newTab)}>
          <Tabs.List>
            <Tabs.Tab w={125} value={tenantStore.INVITE_EVENTS.ACCEPTED}>Accepted</Tabs.Tab>
            <Tabs.Tab w={125} value={tenantStore.INVITE_EVENTS.SENT}>Sent</Tabs.Tab>
            <Tabs.Tab w={125} value={tenantStore.INVITE_EVENTS.MANAGED}>Complete</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>
      <DataTable
        key={`table-${tab}`}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        noRecordsText={emptyTabDescriptions[tab]}
        records={Sort(invites, sortStatus)}
        columns={[
          {
            accessor: "name",
            sortable: true,
            render: invite =>
              <Group gap="xs">
                <div className={S("round-image", "tenant-users__image")}>
                  <ImageIcon
                    icon={invite?.user?.profileImage}
                    alternateIcon={DefaultProfileImage(invite)}
                    label="Profile Image"
                  />
                </div>
                <Stack gap={0}>
                  <Text fw={600} className={S("ellipsis")}>
                    {invite.name || invite.address || ""}
                  </Text>
                  <Text fz={10}>
                    { invite.data.email }
                  </Text>
                </Stack>
              </Group>
          },
          {
            accessor: "address",
            hidden: tab === tenantStore.INVITE_EVENTS.SENT,
            width: 350,
            render: invite => <CopyableField value={invite.address} fz={12}>{invite.address}</CopyableField>
          },
          {
            accessor: "createdAt",
            title: "Date",
            sortable: true,
            width: 250,
            render: user => user.createdAtString
          },
          {
            accessor: "action",
            title: "",
            width: 175,
            render: invite => (
              <Group justify="end" wrap="nowrap" pr="xs">
                {
                  !invite.address ?
                    <UnstyledButton
                      title="View Invite"
                      className={S("text-button")}
                      onClick={() => setShowInviteModal(invite.id)}
                    >
                      View Invite
                    </UnstyledButton> :
                    <UnstyledButton
                      title="Set User Permissions"
                      className={S("text-button")}
                      disabled={!tenantStore.managedGroups || tenantStore.managedGroups.length === 0}
                      onClick={() => setShowPermissionsModal(invite.id)}
                    >
                      Set Permissions
                    </UnstyledButton>
                }
                <UnstyledButton
                  title="Remove Invite"
                  onClick={() => modals.openConfirmModal({
                    title: "Remove Invite",
                    children: <Text mb="lg" fz={16}>Are you sure you want to remove this invite from your history?</Text>,
                    onConfirm: async () => await tenantStore.DeleteInvite({id: invite.data.id}),
                    labels: { confirm: "Confirm", cancel: "Cancel" },
                    centered: true,
                    withCloseButton: false
                  })}
                  className={S("icon-button")}
                >
                  <ImageIcon icon={XIcon} />
                </UnstyledButton>
              </Group>
            )
          }
        ]}
      />
    </div>
  );
});

export default TenantInvites;
