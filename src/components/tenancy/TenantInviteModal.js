import TenantStyles from "../../static/stylesheets/modules/tenancy.module.scss";

import {observer} from "mobx-react";
import React, {useState} from "react";
import {accountsStore, tenantStore} from "../../stores";
import {Button, Group, Modal, NumberInput, Text, TextInput} from "@mantine/core";
import {CreateModuleClassMatcher} from "../../Utils";
import {CopyButton} from "../Misc";

const S = CreateModuleClassMatcher(TenantStyles);

const TenantInviteModal = observer(({existingInviteUrl="", Close}) => {
  const [name, setName] = useState("");
  const [funds, setFunds] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState(existingInviteUrl);
  const [error, setError] = useState(undefined);

  const insufficientFunds = accountsStore.currentAccount.balance < funds + 0.05;
  const valid = name && !insufficientFunds;

  const Submit = async () => {
    if(!valid || insufficientFunds) { return; }

    try {
      setSubmitting(true);
      setInviteUrl(await tenantStore.GenerateInvite({name, funds}));
    } catch (error) {
      setError(error);
    } finally {
      setSubmitting(false);
    }
  };

  let content;
  if(inviteUrl) {
    content = (
      <div className={S("tenant-invite-modal__content")}>
        <Text fz="sm">
          Share this URL with the new user to have them set up their account. After the account is created, you will be notified to grant permissions.
        </Text>
        <div className={S("tenant-invite-modal__url-container")}>
          <div className={S("tenant-invite-modal__url")}>
            { inviteUrl }
          </div>
          <CopyButton value={inviteUrl} className={S("icon-button")} />
        </div>
        <Group justify="right" mt={50}>
          <Button
            type="button"
            onClick={Close}
            w={150}
            h={40}
          >
            Done
          </Button>
        </Group>
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
    >
      {content}
    </Modal>
  );
});

export default TenantInviteModal;
