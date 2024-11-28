import TenantStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, Group, Text, Table, TextInput, Loader, UnstyledButton} from "@mantine/core";

import {tenantStore} from "../../stores";

import {useDebouncedValue} from "@mantine/hooks";
import TenantUserPermissionsModal from "./TenantUserPermissionsModal";
import {DefaultProfileImage, ImageIcon} from "../Misc";
import {CreateModuleClassMatcher} from "../../utils/Utils";

import PermissionsIcon from "../../static/icons/sliders";
import FundsIcon from "../../static/icons/elv-token.png";
import TopUpIcon from "../../static/icons/up-lines";
import {modals} from "@mantine/modals";

const S = CreateModuleClassMatcher(TenantStyles);

const TenantUsers = observer(() => {
  const [tab, setTab] = useState("users");
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantStore.LoadTenantUsers()
      .finally(() => setLoading(false));
    tenantStore.LoadTenantFundingAccount();
  }, []);

  const users = ((tab === "admins" ?
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
    )
    .sort((a, b) => {
      if(a.name) {
        if(b.name) {
          return a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1;
        }

        return -1;
      } else if(b.name) {
        return 1;
      }

      return a.address < b.address ? -1 : 1;
    });

  if(loading) {
    return <Loader className={S("page-loader")} />;
  }

  const fundingLimit = tenantStore.tenantFundingAccount?.per_top_up_limit || 0.2;

  return (
    <>
      { showPermissionsModal ? <TenantUserPermissionsModal address={showPermissionsModal} Close={() => setShowPermissionsModal(false)} /> : null }
      <div className={S("tenant-page")}>
        <div className={S("header-text", "tenant-page__header")}>Manage Users</div>
        <Group align="center" gap={30} w={1000} mb="xl">
          <Tabs variant="pills" color="gray.6" value={tab} onChange={newTab => setTab(newTab)}>
            <Tabs.List grow>
              <Tabs.Tab w={125} value="users">Users</Tabs.Tab>
              <Tabs.Tab w={125} value="admins">Admins</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <TextInput
            value={filter}
            onChange={event => setFilter(event.target.value)}
            placeholder="Filter Users"
            className={S("tenant-users__filter")}
          />
        </Group>
        <div className={S("tenant-users")}>
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
                  users.map(user => (
                    <tr>
                      <td>
                        <Group>
                          <div className={S("round-image", "tenant-users__image")}>
                            <ImageIcon
                              icon={user.profileImage || DefaultProfileImage(user)}
                              alternateIcon={DefaultProfileImage(user)}
                              label="Profile Image"
                            />
                          </div>
                          <Text fw={500}>
                            {user.name || ""}
                          </Text>
                        </Group>
                      </td>
                      <td>
                        <Text fz="sm">
                          {user.address}
                        </Text>
                      </td>
                      <td>
                        <Group gap={3} miw={100}>
                          <ImageIcon icon={FundsIcon} className={S("icon")}/>
                          {parseFloat(user.balance).toFixed(2) || "0.0"}
                        </Group>
                      </td>
                      <td>
                        <Group>
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
                                <Text my="lg" ta="center">
                                  Are you sure you want to top this account up to <ImageIcon icon={FundsIcon} className={S("icon", "icon--small")} />{fundingLimit}?
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
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </div>
          <Text fz="sm" ta="center" mt="sm">{users.length} User{users.length === 1 ? "" : "s"}</Text>
        </div>
      </div>
    </>
  );
});

export default TenantUsers;
