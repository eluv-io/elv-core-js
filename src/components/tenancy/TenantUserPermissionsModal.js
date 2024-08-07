import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Button, Checkbox, Group, Modal, Table, Text} from "@mantine/core";
import {rootStore, tenantStore} from "../../stores";
import {LoadingElement} from "elv-components-js";

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
    >
      <LoadingElement
        loading={!groups || !permissions}
        render={() => (
          <form onSubmit={() => {}}>
            <Table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th><Group position="center">Manager</Group></th>
                  <th><Group position="center">Member</Group></th>
                </tr>
              </thead>
              <tbody>
                {
                  groups.map(group => {
                    const name = group.meta?.public?.name || group?.meta?.name;
                    const settings = permissions[group.address];
                    const isTenantUsersGroup = rootStore.client.utils.EqualAddress(group.address, tenantStore.specialGroups.tenantUsers?.address);
                    return (
                      <tr key={`group-${group.address}`}>
                        <td>
                          <Text fz={name ? "sm" : "xs"}>
                            {name || group.address}
                          </Text>
                        </td>
                        <td>
                          <Group mt="xs" position="center">
                            <Checkbox
                              disabled={settings.owner}
                              aria-label={`Manager of ${name || group.address}`}
                              checked={settings.owner || settings.manager}
                              onChange={event => setPermissions({...permissions, [group.address]: { ...settings, manager: event.currentTarget.checked }})}
                            />
                          </Group>
                        </td>
                        <td>
                          <Group position="center">
                            <Checkbox
                              disabled={isTenantUsersGroup || settings.owner}
                              aria-label={`Manager of ${name || group.address}`}
                              checked={settings.owner || settings.manager || settings.member}
                              onChange={event => setPermissions({...permissions, [group.address]: { ...settings, member: event.currentTarget.checked }})}
                            />
                          </Group>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </Table>
            { !error ? null : <Text mb="md" color="red" ta="center">Something went wrong, please try again</Text> }
            <Group position="right" mt={50} noWrap>
              <Button
                variant="default"
                type="button"
                onClick={Close}
                w={150}
              >
                Cancel
              </Button>
              <Button
                disabled={JSON.stringify(originalPermissions) === JSON.stringify(permissions)}
                type="button"
                w={150}
                loading={submitting}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await tenantStore.SetUserGroupPermissions({userAddress: address, originalPermissions, permissions});

                    if(inviteId) {
                      await tenantStore.CompleteInvite({inviteId});
                    }

                    Close();
                  } catch (error) {
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
        )}
      />
    </Modal>
  );
});

export default TenantUserPermissionsModal;
