import TenancyStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, Group, Text, Button, Loader, UnstyledButton, TextInput} from "@mantine/core";
import TenantInviteModal from "./TenantInviteModal";

import {IconUserPlus} from "@tabler/icons-react";
import {tenantStore} from "../../stores";
import TenantUserPermissionsModal from "./TenantUserPermissionsModal";
import {CreateModuleClassMatcher} from "../../Utils";
import {ImageIcon} from "../Misc";
import {useDebouncedValue} from "@mantine/hooks";
import {modals} from "@mantine/modals";

import XIcon from "../../static/icons/X";
import DefaultAccountImage from "../../static/icons/User.svg";
import AlertIcon from "../../static/icons/alert-circle";


const S = CreateModuleClassMatcher(TenancyStyles);

const Invite = observer(({invite}) => {
  const [showInviteUrl, setShowInviteUrl] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const address = invite.data.address;
  const user = tenantStore.users[address] || {};
  const name = user.name || invite.data.name || address;
  const time = new Date(invite.created * 1000).toLocaleString();

  useEffect(() => {
    if(!address) { return; }

    tenantStore.LoadUser({address});
  }, [invite.data.address]);

  let actions, alert;
  switch (invite.type) {
    case tenantStore.INVITE_EVENTS.SENT:
      actions = (
        <Button variant="default" onClick={() => setShowInviteUrl(true)}>
          View Invite
        </Button>
      );
      break;
    case tenantStore.INVITE_EVENTS.ACCEPTED:
      if(invite.new) {
        alert = true;
      }

    // eslint-disable-next-line no-fallthrough
    case tenantStore.INVITE_EVENTS.MANAGED:
      actions = (
        <Button onClick={() => setShowPermissionsModal(true)}>
          Set Permissions
        </Button>
      );
  }

  return (
    <>
      { showInviteUrl ? <TenantInviteModal existingInviteId={invite.data.id} Close={() => setShowInviteUrl(false)} /> : null }
      { showPermissionsModal ? <TenantUserPermissionsModal address={invite.data.address} inviteId={invite.data.id} Close={() => setShowPermissionsModal(false)} /> : null }
      <div className={S("invite")}>
        {
          !alert ? null :
            <ImageIcon
              icon={AlertIcon}
              title="The user has accepted your invitation. Please set their permissions."
              className={S("icon", "invite__alert")}
            />
        }

        {
          !address ? null :
            <div className={S("round-image", "invite__image")}>
              <ImageIcon icon={user.profileImage || DefaultAccountImage} alternateIcon={DefaultAccountImage} />
            </div>
        }

        <UnstyledButton
          onClick={() => modals.openConfirmModal({
            title: "Remove Invite",
            children: <Text my="md">Are you sure you want to remove this invite from your history?</Text>,
            onConfirm: async () => await tenantStore.DeleteInvite({id: invite.data.id}),
            labels: { confirm: "Confirm", cancel: "Cancel" },
            centered: true
          })}
          className={S("icon-button", "invite__delete")}
        >
          <ImageIcon icon={XIcon} />
        </UnstyledButton>
        <div className={S("invite__text")}>
          <Text fw={600}>{name}</Text>
          { invite?.data?.email ? <Text fz={12}>{invite.data.email}</Text> : null }
          {address ? <Text fz={10}>{address}</Text> : null}
          <Text fz={14} fw={500} mt="sm" className={S("invite__time")}>
            {time}
          </Text>
          <Group mt="md" className={S("invite__actions")}>
            {actions}
          </Group>
        </div>
      </div>
    </>
  );
});

const TenantInvites = observer(() => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [tab, setTab] = useState(tenantStore.INVITE_EVENTS.ACCEPTED);
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  useEffect(() => {
    tenantStore.LoadInviteNotifications();
  }, []);

  const invites = tenantStore.Invites(tab);
  const emptyTabDescriptions = {
    [tenantStore.INVITE_EVENTS.SENT]: "No pending invites",
    [tenantStore.INVITE_EVENTS.ACCEPTED]: "No new accounts",
    [tenantStore.INVITE_EVENTS.MANAGED]: "No completed invites"
  };

  if(!tenantStore.invites) {
    return <Loader className={S("page-loader")} />;
  }

  return (
    <>
      { showInviteModal ? <TenantInviteModal Close={() => setShowInviteModal(false)} /> : null }
      <div className={S("tenant-page")}>
        <div className={S("header-text", "tenant-page__header")}>User Invitations</div>
        <Group align="center" justify="space-between" wrap="nowrap" w={500} pr={10}>
          <Tabs h="max-content" variant="pills" color="gray.6" value={tab} onChange={newTab => setTab(newTab)}>
            <Tabs.List grow>
              <Tabs.Tab w={125} value={tenantStore.INVITE_EVENTS.ACCEPTED}>Accepted</Tabs.Tab>
              <Tabs.Tab w={125} value={tenantStore.INVITE_EVENTS.SENT}>Sent</Tabs.Tab>
              <Tabs.Tab w={125} value={tenantStore.INVITE_EVENTS.MANAGED}>Complete</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <UnstyledButton
            ml={20}
            title="Invite New User"
            className={S("icon-button", "icon-button--accent")}
            onClick={() => setShowInviteModal(true)}
          >
            <IconUserPlus/>
          </UnstyledButton>
        </Group>
        {
          !invites || invites.length === 0 ?
            <Text fw={500} w={400} ta="center" mt={50}>{emptyTabDescriptions[tab]}</Text> :
            <>
              <TextInput
                mt="md"
                value={filter}
                onChange={event => setFilter(event.target.value)}
                placeholder="Filter Invites"
                maw={500}
                className={S("invites__filter")}
              />
              <div className={S("invites")}>
                {
                  invites
                    .filter(invite => !debouncedFilter || invite?.data?.name?.toLowerCase()?.includes(debouncedFilter.toLowerCase()))
                    .map(invite =>
                      <Invite invite={invite} key={`invite-${invite.data.id}`}/>
                    )
                }
              </div>
            </>
        }
      </div>
    </>
  );
});

export default TenantInvites;
