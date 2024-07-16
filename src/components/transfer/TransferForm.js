import React, {useState} from "react";
import {Navigate} from "react-router";
import {observer} from "mobx-react";
import {Title, Paper, Select, TextInput, NumberInput, Button, Group, Text} from "@mantine/core";
import {accountsStore} from "../../stores";
import {Utils} from "@eluvio/elv-client-js";
import {Link} from "react-router-dom";

const TransferForm = observer(() => {
  const accounts = Object.values(accountsStore.accounts)
    .map(account => ({label: account.name || account.address, value: account.address}));

  const [recipientAddress, setRecipientAddress] = useState(accounts[0]?.value || "");
  const [customRecipientAddress, setCustomRecipientAddress] = useState("");
  const [amount, setAmount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);
  const [complete, setComplete] = useState(false);

  accounts.unshift({label: "[Other]", value: ""});

  const insufficientFunds = accountsStore.currentAccount.balance < amount + 0.05;
  const valid =
    (recipientAddress || customRecipientAddress) &&
    Utils.ValidAddress(recipientAddress || customRecipientAddress) &&
    amount > 0 &&
    !insufficientFunds;

  if(complete) {
    return <Navigate to="/accounts" />;
  }

  const Submit = async () => {
    if(!valid) { return; }

    setSubmitting(true);
    setError(undefined);

    try {
      await accountsStore.SendFunds({
        recipient: !recipientAddress ? customRecipientAddress : recipientAddress,
        ether: amount
      });

      setComplete(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setSubmitting(false);
      setError(error.toString());
    }
  };

  return (
    <div className="page-content">
      <Paper withBorder p="xl" pr={50} shadow="sm" className="form-container">
        <form onSubmit={() => {}}>
          <Title order={4} mb="xl">Transfer Funds</Title>
          <Select
            mb="md"
            searchable
            data={accounts}
            label="Recipient"
            value={recipientAddress}
            onChange={address => setRecipientAddress(address)}
          />
          {
            recipientAddress ? null :
              <TextInput
                error={customRecipientAddress && !Utils.ValidAddress(customRecipientAddress) ? "Invalid Address" : ""}
                placeholder={Utils.nullAddress}
                mb="md"
                label="Recipient Address"
                value={customRecipientAddress}
                onChange={event => setCustomRecipientAddress(event.currentTarget.value)}
              />
          }
          <NumberInput
            error={!amount ? true : (insufficientFunds ? "Insufficient Funds" : undefined)}
            mb="md"
            label="Amount"
            value={amount}
            min={0}
            step={0.05}
            precision={2}
            stepHoldDelay={500}
            stepHoldInterval={50}
            onChange={value => setAmount(value)}
            onKeyDown={event => {
              if(event.key !== "Enter") { return; }

              Submit();
            }}
          />
          <Group mt={50} />
          { !error ? null : <Text mb="md" color="red" ta="center">Something went wrong, please try again</Text> }
          <Group position="right" noWrap>
            <Button
              variant="default"
              type="button"
              component={Link}
              to="/accounts"
              w={150}
            >
              Cancel
            </Button>
            <Button
              disabled={!valid}
              loading={submitting}
              type="button"
              w={150}
              onClick={Submit}
            >
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
});


export default TransferForm;
