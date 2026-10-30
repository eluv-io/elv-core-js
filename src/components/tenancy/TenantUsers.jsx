import TenantStyles from "@/assets/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, Group, Text, TextInput, Loader, UnstyledButton} from "@mantine/core";
import {tenantStore} from "@/stores";
import {useDebouncedValue} from "@mantine/hooks";
import TenantUserPermissionsModal from "@/components/tenancy/TenantUserPermissionsModal";
import {CopyableField, DefaultProfileImage, ImageIcon} from "@/components/Misc";
import {CreateModuleClassMatcher, Sort} from "@/utils/Utils";
import {modals} from "@mantine/modals";
import DataTable from "@/components/common/DataTable.jsx";

import PermissionsIcon from "@/assets/icons/sliders.svg";
import FundsIcon from "@/assets/icons/elv-token.png";
import TopUpIcon from "@/assets/icons/up-lines.svg";
import SearchIcon from "@/assets/icons/search.svg";

const S = CreateModuleClassMatcher(TenantStyles);

const TenantUsers = observer(() => {
  const [tab, setTab] = useState("users");
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantStore.LoadTenantUsers()
      .finally(() => setLoading(false));
    tenantStore.LoadTenantFundingAccount();
  }, []);

  let users = ((tab === "admins" ?
    tenantStore.tenantAdmins :
    tenantStore.tenantUsers
  ) || [])
    .filter(address =>
      tab !== "users" ||
      !tenantStore.tenantAdmins.includes(address)
    )
    .map(address => tenantStore.users[address])
    .filter(user =>
      !debouncedFilter ||
      (user?.name || "").toLowerCase().includes(debouncedFilter.toLowerCase())
    );

  if(loading) {
    return <Loader className={S("page-loader")} />;
  }

  const fundingLimit = tenantStore.tenantFundingAccount?.per_top_up_limit || 0.2;

  return (
    <div className={S("tenant-page")}>
      { showPermissionsModal ? <TenantUserPermissionsModal address={showPermissionsModal} Close={() => setShowPermissionsModal(false)} /> : null }

      <div className={S("header-text", "tenant-page__header")}>Manage Users</div>
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
      <Group align="center" gap={30} w="100%" maw={1200} mb="md">
        <Tabs w="100%" maw={1200} color="blue.6" value={tab} onChange={newTab => setTab(newTab)}>
          <Tabs.List>
            <Tabs.Tab w={125} fw={600} value="users">Users</Tabs.Tab>
            <Tabs.Tab w={125} fw={600} value="admins">Admins</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>
      <DataTable
        key={`table-${tab}`}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        records={Sort(users, sortStatus)}
        columns={[
          {
            accessor: "name",
            sortable: true,
            render: user =>
              <Group gap="xs">
                <div className={S("round-image", "tenant-users__image")}>
                  <ImageIcon
                    icon={user.profileImage}
                    alternateIcon={DefaultProfileImage(user)}
                    label="Profile Image"
                  />
                </div>
                <Text fw={500} maw={300} className={S("ellipsis")}>
                  {user.name || user.address || ""}
                </Text>
              </Group>
          },
          {
            accessor: "address",
            hidden: tab === tenantStore.INVITE_EVENTS.SENT,
            width: 350,
            render: user => <CopyableField value={user.address} fz={12}>{user.address}</CopyableField>
          },
          {
            accessor: "balance",
            width: 150,
            sortable: true,
            render: user => <Group gap={0}><ImageIcon label="Funds Icon" icon={FundsIcon} className={S("icon", "icon--small")} />{parseFloat(user.balance || 0).toFixed(2)}</Group>
          },
          {
            accessor: "action",
            title: "",
            width: 100,
            render: user => (
              <Group justify="end" pr="xs">
                <UnstyledButton
                  title="Top Up Funds"
                  className={S("icon-button")}
                  disabled={
                    parseFloat(user.balance) > fundingLimit - 0.01 ||
                    tenantStore.tenantFunds < 0.1
                  }
                  onClick={() => modals.openConfirmModal({
                    title: "Top Up Account",
                    children: (
                      <Text mb="lg" ta="center" className={S("top-up-message")}>
                        Are you sure you want to top this account up to <ImageIcon label="Funds Icon" icon={FundsIcon} className={S("icon", "icon--small")} />{fundingLimit}?
                      </Text>
                    ),
                    onConfirm: async () => await tenantStore.TopUpFunds(user.address),
                    labels: { confirm: "Confirm", cancel: "Cancel" },
                    centered: true,
                    withCloseButton: false
                  })}
                >
                  <ImageIcon icon={TopUpIcon}/>
                </UnstyledButton>
                <UnstyledButton
                  title="Manage User Permissions"
                  className={S("icon-button")}
                  disabled={!tenantStore.managedGroups || tenantStore.managedGroups.length === 0}
                  onClick={() => setShowPermissionsModal(user.address)}
                >
                  <ImageIcon icon={PermissionsIcon}/>
                </UnstyledButton>
              </Group>
            )
          }
        ]}
      />
    </div>
  );
});

export default TenantUsers;
