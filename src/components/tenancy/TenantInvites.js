import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Tabs, ActionIcon, Group, Paper, Text, Button} from "@mantine/core";
import TenantInviteModal from "./TenantInviteModal";

import {IconUserPlus} from "@tabler/icons-react";
import {Balance, Confirm, CroppedIcon, IconButton, ImageIcon, LoadingElement} from "elv-components-js";
import LockedIcon from "../../static/icons/Locked.svg";
import UnlockedIcon from "../../static/icons/Unlocked.svg";
import RemoveAccountIcon from "../../static/icons/X.svg";
import {accountsStore, tenantStore} from "../../stores";
import DefaultAccountImage from "../../static/icons/User.svg";

const Invite = observer(({invite}) => {
  const [profileImageUrl, setProfileImageUrl] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showInviteUrl, setShowInviteUrl] = useState(false);

  const address = invite.data.address;
  const name = invite.data.name || address;
  const time = new Date(invite.created * 1000).toLocaleString();

  useEffect(() => {
    if(!address) { return; }

    accountsStore.ProfileImage({address})
      .then(url => setProfileImageUrl(url));

    accountsStore.AccountBalance(address)
      .then(balance => setBalance(balance));
  }, [invite.data.address]);

  let actions;
  switch (invite.type) {
    case tenantStore.INVITE_EVENTS.SENT:
      actions = (
        <Button variant="default" onClick={() => setShowInviteUrl(true)}>
          Show Invite
        </Button>
      );
      break;
    case tenantStore.INVITE_EVENTS.ACCEPTED:
      actions = (
        <Button onClick={() => setShowInviteUrl(true)}>
          Set Permissions
        </Button>
      );
  }

  return (
    <>
      { showInviteUrl ? <TenantInviteModal existingInviteUrl={invite.data.url} Close={() => setShowInviteUrl(false)} /> : null }
      <Paper withBorder p="md" className="invite">
        <Group>
          <CroppedIcon
            icon={profileImageUrl || DefaultAccountImage}
            alternateIcon={DefaultAccountImage}
            label="Profile Image"
            className="invite__image"
            useLoadingIndicator={true}
          />
          <div className="invite__main">
            <div className="account-info">
              <Text fw={500}>{name}</Text>
              { address ? <Text fz="xs">{address}</Text> : null }
              <Balance balance={balance} className="invite__balance" />
            </div>
            <Group className="invite__actions">
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
  const [tab, setTab] = useState("accepted");

  useEffect(() => {
    tenantStore.LoadInviteNotifications();
  }, []);

  const invites = tenantStore.invites?.[tab];

  console.log(invites);

  return (
    <LoadingElement
      loading={!tenantStore.invites}
      fullPage
    >
      { showInviteModal ? <TenantInviteModal Close={() => setShowInviteModal(false)} /> : null }
      <div className="page-content tenant-page">
        <div className="tenant-invite__tabs">
          <Tabs h="max-content" variant="pills" color="gray.6" value={tab} onTabChange={newTab => setTab(newTab)}>
            <Tabs.List>
              <Tabs.Tab value="accepted">Accepted</Tabs.Tab>
              <Tabs.Tab value="sent">Sent</Tabs.Tab>
              <Tabs.Tab value="managed">Complete</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <ActionIcon className="tenant-invite__invite-button" onClick={() => setShowInviteModal(true)}>
            <IconUserPlus />
          </ActionIcon>
        </div>
        <div className="tenant-invite__invites">
          { (invites || []).map(invite => <Invite invite={invite} key={`invite-${invite.data.id}`} />) }
        </div>
      </div>
    </LoadingElement>
  );
});

export default TenantInvites;
