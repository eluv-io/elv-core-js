import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, Group, Text, Table, TextInput, ActionIcon} from "@mantine/core";

import {Balance,  CroppedIcon, LoadingElement} from "elv-components-js";
import {tenantStore} from "../../stores";
import DefaultAccountImage from "../../static/icons/User.svg";

import {useDebouncedValue} from "@mantine/hooks";
import {IconUser} from "@tabler/icons-react";
import TenantUserPermissionsModal from "./TenantUserPermissionsModal";

const TenantUsers = observer(() => {
  const [tab, setTab] = useState("users");
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    tenantStore.LoadTenantUsers();
  }, []);

  const users = tab === "admins" ? tenantStore.tenantAdmins : tenantStore.tenantUsers;

  return (
    <LoadingElement
      loading={!users}
      fullPage
    >
      { showPermissionsModal ? <TenantUserPermissionsModal address={showPermissionsModal} Close={() => setShowPermissionsModal(false)} /> : null }
      <div className="page-content tenant-page">
        <Group align="center" position="center" className="tenant-page__nav" wrap="nowrap">
          <Tabs h="max-content" variant="pills" color="gray.6" value={tab} onTabChange={newTab => setTab(newTab)} className="tenant-page__tabs">
            <Tabs.List grow>
              <Tabs.Tab value="users">Users</Tabs.Tab>
              <Tabs.Tab value="admins">Admins</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Group>
        <div className="tenant-users">
          <TextInput mt="xl" mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
          <Table w="100%" withBorder className="tenant-users__users">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                (users || [])
                  .filter(address =>
                    !debouncedFilter ||
                    (tenantStore.users[address]?.name || "").toLowerCase().includes(debouncedFilter.toLowerCase())
                  )
                  .map(address => {
                    const user = tenantStore.users[address];

                    return (
                      <tr>
                        <td>
                          <Group>
                            <CroppedIcon
                              icon={user.profileImage || DefaultAccountImage}
                              alternateIcon={DefaultAccountImage}
                              label="Profile Image"
                              className="tenant-users__image"
                              useLoadingIndicator={true}
                            />
                            <Text fw={500}>
                              {user.name || ""}
                            </Text>
                          </Group>
                        </td>
                        <td>
                          <Text fz="xs" className="tenant-users__address">
                            {address}
                          </Text>
                        </td>
                        <td>
                          <Balance balance={user.balance}/>
                        </td>
                        <td>
                          <ActionIcon title="Manage User Permissions" className="tenant-page__tab-button" onClick={() => setShowPermissionsModal(address)}>
                            <IconUser />
                          </ActionIcon>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </Table>
        </div>
      </div>
    </LoadingElement>
  );
});

export default TenantUsers;
