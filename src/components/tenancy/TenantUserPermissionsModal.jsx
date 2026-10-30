import TenancyStyles from "@/assets/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Button, Checkbox, Group, Loader, Modal, Stack, Text} from "@mantine/core";
import {rootStore, tenantStore} from "@/stores";
import {CreateModuleClassMatcher, Sort} from "@/utils/Utils";
import {CopyableField} from "@/components/Misc";
import DataTable from "@/components/common/DataTable.jsx";

const S = CreateModuleClassMatcher(TenancyStyles);

const TenantUserPermissionsModal = observer(({address, inviteId, Close}) => {
  const groups = tenantStore.managedGroups;
  const [originalPermissions, setOriginalPermissions] = useState(undefined);
  const [permissions, setPermissions] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});

  useEffect(() => {
    tenantStore.LoadManagedGroups()
      .then(async () => {
        const userPermissions = await tenantStore.UserManagedGroupMembership({userAddress: address});

        setOriginalPermissions(userPermissions);
        setPermissions(userPermissions);

        // Ensure the user will be added to the tenant users group
        const tenantUserGroupAddress = tenantStore.specialGroups.tenantUsers?.address;
        if(tenantUserGroupAddress) {
          setPermissions({
            ...userPermissions,
            [tenantUserGroupAddress]: {
              manager: userPermissions[tenantUserGroupAddress]?.manager || false,
              member: true
            }
          });
        }
      });
  }, []);

  return (
    <Modal
      opened
      centered
      padding="xl"
      title="Set User Permissions"
      onClose={Close}
      size="lg"
      withCloseButton={false}
    >
      {
        !groups || !permissions  ?
          <Loader className={S("page-loader", "page-loader--short")} /> :
          <form onSubmit={event => event.preventDefault()}>
            <div className={S("tenant-permissions")}>
              <DataTable
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                records={Sort(groups, sortStatus)}
                columns={[
                  {
                    accessor: "name",
                    title: "Group",
                    sortable: true,
                    render: group =>
                      <Stack gap={0}>
                        <Text fw={500}>{group.meta?.public?.name || group?.meta?.name || ""}</Text>
                        <CopyableField value={group.address} fz={9}>{group.address}</CopyableField>
                      </Stack>
                  },
                  {
                    accessor: "manager",
                    textAlign: "center",
                    render: group =>
                      <Group justify="center">
                        <Checkbox
                          disabled={permissions?.[group.address]?.owner || !group.isOwner}
                          title={
                            permissions?.[group.address]?.owner ?
                              "This user is the owner of this group" :
                              !group.isOwner ? "Only group owners may add managers" :
                                undefined
                          }
                          aria-label={`Manager of ${name || group.address}`}
                          checked={permissions?.[group.address]?.owner || permissions?.[group.address]?.manager}
                          onChange={event => setPermissions({
                            ...permissions,
                            [group.address]: {...(permissions?.[group.address] || {}), manager: event.currentTarget.checked}
                          })}
                        />
                      </Group>
                  },
                  {
                    accessor: "member",
                    textAlign: "center",
                    render: group =>
                      <Group justify="center">
                        <Checkbox
                          disabled={
                            // Tenant Users group, cannot be removed
                            rootStore.client.utils.EqualAddress(group.address, tenantStore.specialGroups.tenantUsers?.address) ||
                            permissions?.[group.address]?.owner ||
                            permissions?.[group.address]?.manager
                          }
                          title={
                            // Tenant Users group, cannot be removed
                            rootStore.client.utils.EqualAddress(group.address, tenantStore.specialGroups.tenantUsers?.address) ?
                              "Users may not be removed from the tenant users group" :
                              permissions?.[group.address]?.owner ?
                                "This user is the owner of this group" :
                                permissions?.[group.address]?.manager ? "Managers of groups are also members" :
                                  undefined
                          }
                          aria-label={`Manager of ${name || group.address}`}
                          checked={permissions?.[group.address]?.owner || permissions?.[group.address]?.manager || permissions?.[group.address]?.member}
                          onChange={event => setPermissions({
                            ...permissions,
                            [group.address]: {...(permissions?.[group.address] || {}), member: event.currentTarget.checked}
                          })}
                        />
                      </Group>
                  }
                ]}
              />
            </div>
            {!error ? null :
              <Text mb="md" mt="xl" color="red" ta="center">Something went wrong, please try again</Text>}
            <Group justify="right" mt={50} wrap="nowrap">
              <Button
                variant="default"
                type="button"
                onClick={Close}
                h={40}
                w={150}
              >
                Cancel
              </Button>
              <Button
                disabled={JSON.stringify(originalPermissions) === JSON.stringify(permissions)}
                type="button"
                h={40}
                w={150}
                loading={submitting}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await tenantStore.SetUserGroupPermissions({
                      userAddress: address,
                      originalPermissions,
                      permissions
                    });

                    if(inviteId) {
                      await tenantStore.CompleteInvite({id: inviteId});
                    }

                    rootStore.SetToastMessage("User permissions updated successfully");

                    Close();
                  } catch (error) {
                    tenantStore.Log(error, true);
                    setOriginalPermissions(await tenantStore.UserManagedGroupMembership({userAddress: address}));
                    setError(error);
                    setSubmitting(false);
                  }
                }}
              >
                  Submit
              </Button>
            </Group>
          </form>
      }
    </Modal>
  );
});

export default TenantUserPermissionsModal;
