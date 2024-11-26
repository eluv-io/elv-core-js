import TenantStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import {observer} from "mobx-react";
import React, {useState} from "react";
import {rootStore, accountsStore, tenantStore} from "../../stores";
import {Button, Group, Modal, NumberInput, Text, TextInput} from "@mantine/core";
import {CreateModuleClassMatcher, ValidEmail} from "../../Utils";
import {CopyButton} from "../Misc";

const S = CreateModuleClassMatcher(TenantStyles);

const TenantInviteModal = observer(({existingInviteId="", Close}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [funds, setFunds] = useState(0.1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);

  const insufficientFunds = accountsStore.currentAccount.balance < funds + 0.05;
  const valid = name && email && ValidEmail(email) && !insufficientFunds;

  const invite = existingInviteId && tenantStore.invites[existingInviteId];

  const Submit = async () => {
    if(!valid || insufficientFunds) { return; }

    try {
      setSubmitting(true);
      await tenantStore.GenerateInvite({name, email, funds});
      rootStore.SetToastMessage(`An invite has been sent to ${email}`);

      Close();
    } catch (error) {
      tenantStore.Log(error, true);
      setError(error);
    } finally {
      setSubmitting(false);
    }
  };

  let content;
  if(invite) {
    content = (
      <div className={S("tenant-invite-modal__content")}>
        <Text fz="sm">
          An invitation email has been sent to <b>{invite.data.email || invite.data.name}</b>.
        </Text>

        <Text fz="sm" mt="md">
          You may also share this URL with the new user to have them set up their account. After the account is created, you will be notified to grant permissions.
        </Text>
        <div className={S("tenant-invite-modal__url-container")}>
          <div className={S("tenant-invite-modal__url")}>
            { invite.data.url }
          </div>
          <CopyButton value={invite.data.url} className={S("icon-button")} />
        </div>
      </div>
    );
  } else {
    content = (
      <form onSubmit={() => {}}>
        <TextInput
          label="Name"
          mt="md"
          mb="md"
          value={name}
          onChange={event => setName(event.currentTarget.value)}
          onKeyDown={event => {
            if(event.key !== "Enter") { return; }

            Submit();
          }}
        />
        <TextInput
          label="Email Address"
          mt="md"
          mb="md"
          value={email}
          onChange={event => setEmail(event.currentTarget.value)}
          onKeyDown={event => {
            if(event.key !== "Enter") { return; }

            Submit();
          }}
        />
        <NumberInput
          error={!funds ? true : (insufficientFunds ? "Insufficient Funds" : undefined)}
          mb="md"
          label="Funds"
          value={funds}
          min={0}
          step={0.05}
          precision={2}
          stepHoldDelay={500}
          stepHoldInterval={50}
          onChange={value => setFunds(value)}
          onKeyDown={event => {
            if(event.key !== "Enter") { return; }

            Submit();
          }}
        />
        { !error ? null : <Text mb="md" color="red" ta="center">Something went wrong, please try again</Text> }
        <Group justify="right" mt={50} wrap="nowrap">
          <Button
            variant="default"
            type="button"
            onClick={Close}
            w={150}
            h={40}
          >
            Cancel
          </Button>
          <Button
            disabled={!valid}
            type="button"
            w={150}
            h={40}
            loading={submitting}
            onClick={Submit}
          >
            Next
          </Button>
        </Group>
      </form>
    );
  }

  return (
    <Modal
      opened
      centered
      padding="xl"
      title="Invite New User"
      onClose={Close}
      withCloseButton={false}
    >
      {content}
    </Modal>
  );
});

export default TenantInviteModal;
