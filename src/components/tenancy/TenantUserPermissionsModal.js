import TenancyStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Button, Checkbox, Group, Loader, Modal, Table, Text} from "@mantine/core";
import {rootStore, tenantStore} from "../../stores";
import {CreateModuleClassMatcher} from "../../utils/Utils";

const S = CreateModuleClassMatcher(TenancyStyles);

const TenantUserPermissionsModal = observer(({address, inviteId, Close}) => {
  const groups = tenantStore.managedGroups;
  const [originalPermissions, setOriginalPermissions] = useState(undefined);
  const [permissions, setPermissions] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);

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
          <form onSubmit={() => {}}>
            <div className={S("tenant-permissions")}>
              <Table className={S("tenant-permissions__table")}>
                <thead>
                  <tr>
                    <th>Group</th>
                    <th><Group justify="center" px={10}>Manager</Group></th>
                    <th><Group justify="center">Member</Group></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    groups.map((group, index) => {
                      const name = group.meta?.public?.name || group?.meta?.name;
                      const settings = permissions[group.address];
                      const isTenantUsersGroup = rootStore.client.utils.EqualAddress(group.address, tenantStore.specialGroups.tenantUsers?.address);
                      return (
                        <tr key={`group-${group.address}`}
                          className={S(`tenant-permissions__row--${index % 2 === 0 ? "even" : "odd"}`)}>
                          <td>
                            <Text fz={name ? "sm" : "xs"} p="sm">
                              {name || group.address}
                            </Text>
                          </td>
                          <td>
                            <Group justify="center" align="center">
                              <Checkbox
                                disabled={settings.owner || !group.isOwner}
                                title={
                                  settings.owner ?
                                    "This user is the owner of this group" :
                                    !group.isOwner ? "Only group owners may add managers" :
                                      undefined
                                }
                                aria-label={`Manager of ${name || group.address}`}
                                checked={settings.owner || settings.manager}
                                onChange={event => setPermissions({
                                  ...permissions,
                                  [group.address]: {...settings, manager: event.currentTarget.checked}
                                })}
                              />
                            </Group>
                          </td>
                          <td>
                            <Group justify="center">
                              <Checkbox
                                disabled={isTenantUsersGroup || settings.owner || settings.manager}
                                title={
                                  isTenantUsersGroup ?
                                    "Users may not be removed from the tenant users group" :
                                    settings.owner ?
                                      "This user is the owner of this group" :
                                      settings.manager ? "Managers of groups are also members" :
                                        undefined
                                }
                                aria-label={`Manager of ${name || group.address}`}
                                checked={settings.owner || settings.manager || settings.member}
                                onChange={event => setPermissions({
                                  ...permissions,
                                  [group.address]: {...settings, member: event.currentTarget.checked}
                                })}
                              />
                            </Group>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </Table>
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
