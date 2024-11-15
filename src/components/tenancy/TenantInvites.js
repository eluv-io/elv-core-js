import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, ActionIcon, Group, Paper, Text, Button, Loader} from "@mantine/core";
import TenantInviteModal from "./TenantInviteModal";

import {IconUserPlus} from "@tabler/icons-react";
import {tenantStore} from "../../stores";
import DefaultAccountImage from "../../static/icons/User.svg";
import TenantUserPermissionsModal from "./TenantUserPermissionsModal";

import {IconAlertCircle} from "@tabler/icons-react";
import {ImageIcon} from "../Misc";

import FundsIcon from "../../static/icons/elv-token";

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
          Show Invite
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
      { showInviteUrl ? <TenantInviteModal existingInviteUrl={invite.data.url} Close={() => setShowInviteUrl(false)} /> : null }
      { showPermissionsModal ? <TenantUserPermissionsModal address={invite.data.address} inviteId={invite.data.id} Close={() => setShowPermissionsModal(false)} /> : null }
      <Paper withBorder p="xs" className="invite">
        { alert ? <IconAlertCircle className="invite__indicator" /> : null }
        <Group wrap="nowrap">
          <ImageIcon icon={user.profileImage || DefaultAccountImage} alternateIcon={DefaultAccountImage} />
          <div className="invite__main">
            <div>
              <Text fw={500}>{name}</Text>
              { address ? <Text fz="xs" className="invite__address">{address}</Text> : null }
              <Group gap={3}>
                <ImageIcon icon={FundsIcon} className="icon" />
                { user.balance || "0.0" }
              </Group>
            </div>
            <Group mt="md" className="invite__actions">
              { actions }
            </Group>
            <div className="invite__time">
              { time }
            </div>
          </div>
        </Group>
      </Paper>
    </>
  );
});

const TenantInvites = observer(() => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [tab, setTab] = useState(tenantStore.INVITE_EVENTS.ACCEPTED);

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
    return <Loader />;
  }

  return (
    <>
      { showInviteModal ? <TenantInviteModal Close={() => setShowInviteModal(false)} /> : null }
      <div className="page-content tenant-page">
        <Group align="center" position="center" className="tenant-page__nav" wrap="nowrap">
          <Tabs h="max-content" variant="pills" color="gray.6" value={tab} onTabChange={newTab => setTab(newTab)} className="tenant-page__tabs">
            <Tabs.List grow>
              <Tabs.Tab value={tenantStore.INVITE_EVENTS.ACCEPTED}>Accepted</Tabs.Tab>
              <Tabs.Tab value={tenantStore.INVITE_EVENTS.SENT}>Sent</Tabs.Tab>
              <Tabs.Tab value={tenantStore.INVITE_EVENTS.MANAGED}>Complete</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <ActionIcon title="Invite New User" className="tenant-page__tab-button" onClick={() => setShowInviteModal(true)}>
            <IconUserPlus />
          </ActionIcon>
        </Group>
        <div className="tenant-invite__invites">
          {
            !invites || invites.length === 0 ?
              <Text fw={400} italic mt={50}>{emptyTabDescriptions[tab]}</Text> :
              invites.map(invite => <Invite invite={invite} key={`invite-${invite.data.id}`} />)
          }
        </div>
      </div>
    </>
  );
});

export default TenantInvites;
