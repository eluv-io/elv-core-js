import TenantStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, Group, Text, Table, TextInput, Loader, UnstyledButton} from "@mantine/core";

import {tenantStore} from "../../stores";

import {useDebouncedValue} from "@mantine/hooks";
import TenantUserPermissionsModal from "./TenantUserPermissionsModal";
import {ImageIcon} from "../Misc";
import {CreateModuleClassMatcher} from "../../Utils";

import DefaultAccountImage from "../../static/icons/User.svg";
import PermissionsIcon from "../../static/icons/sliders";
import FundsIcon from "../../static/icons/elv-token.png";

const S = CreateModuleClassMatcher(TenantStyles);

const TenantUsers = observer(() => {
  const [tab, setTab] = useState("users");
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    tenantStore.LoadTenantUsers();
  }, []);

  const users = tab === "admins" ? tenantStore.tenantAdmins : tenantStore.tenantUsers;

  if(!users) {
    return <Loader className={S("page-loader")} />;
  }

  return (
    <>
      { showPermissionsModal ? <TenantUserPermissionsModal address={showPermissionsModal} Close={() => setShowPermissionsModal(false)} /> : null }
      <div className={S("tenant-page")}>
        <div className={S("header", "tenant-page__header")}>Manage Users</div>
        <Group>
          <Tabs variant="pills" color="gray.6" value={tab} onChange={newTab => setTab(newTab)}>
            <Tabs.List grow>
              <Tabs.Tab w={125} value="users">Users</Tabs.Tab>
              <Tabs.Tab w={125} value="admins">Admins</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Group>
        <div className={S("tenant-users")}>
          <TextInput
            mt="xl"
            mb="md"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            placeholder="Filter Users"
            maw={500}
            className={S("tenant-users__filter")}
          />
          <div className={S("tenant-users__table-container")}>
            <Table w="100%" withBorder className={S("tenant-users__table")}>
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
                              <div className={S("round-image", "tenant-users__image")}>
                                <ImageIcon
                                  icon={user.profileImage || DefaultAccountImage}
                                  alternateIcon={DefaultAccountImage}
                                  label="Profile Image"
                                />
                              </div>
                              <Text fw={500}>
                                {user.name || ""}
                              </Text>
                            </Group>
                          </td>
                          <td>
                            <Text fz="xs">
                              {address}
                            </Text>
                          </td>
                          <td>
                            <Group gap={3} miw={100}>
                              <ImageIcon icon={FundsIcon} className={S("icon")}/>
                              {user.balance || "0.0"}
                            </Group>
                          </td>
                          <td>
                            <UnstyledButton
                              title="Manage User Permissions"
                              className={S("icon-button")}
                              onClick={() => setShowPermissionsModal(address)}
                            >
                              <ImageIcon icon={PermissionsIcon}/>
                            </UnstyledButton>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
});

export default TenantUsers;
