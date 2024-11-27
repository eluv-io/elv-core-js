import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Select, TextInput, NumberInput, Button, Group, Text} from "@mantine/core";
import {rootStore, accountsStore, tenantStore} from "../../stores";
import {Utils} from "@eluvio/elv-client-js";
import {Link, useNavigate} from "react-router-dom";
import {CreateModuleClassMatcher} from "../../utils/Utils";
import {ImageIcon} from "../Misc";
import FundsIcon from "../../static/icons/elv-token.png";

const S = CreateModuleClassMatcher();

const TransferForm = observer(() => {
  const navigate = useNavigate();
  const accounts = Object.values(accountsStore.sortedAccounts)
    .filter(address => address !== accountsStore.currentAccountAddress)
    .map(address => accountsStore.accounts[address])
    .filter(account => account)
    .map(account => ({label: account.name || account.address, value: account.address}));

  const [recipientAddress, setRecipientAddress] = useState(accounts[0]?.value || "");
  const [customRecipientAddress, setCustomRecipientAddress] = useState("");
  const [amount, setAmount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    if(!accountsStore.isTenantAdmin) { return; }

    tenantStore.LoadTenantFundingAccount({
      tenantContractId: accountsStore.currentAccount.tenantContractId
    });
  }, [accountsStore.isTenantAdmin]);

  if(accountsStore.isTenantAdmin && tenantStore.tenantFundingAccount) {
    accounts.unshift({
      label: "Tenant Funding Address",
      value: tenantStore.tenantFundingAccount.tenant_funding_address
    });
  }

  accounts.unshift({label: "[Other]", value: ""});

  const insufficientFunds = accountsStore.currentAccount.balance < amount + 0.05;
  const valid =
    (recipientAddress || customRecipientAddress) &&
    Utils.ValidAddress(recipientAddress || customRecipientAddress) &&
    amount > 0 &&
    !insufficientFunds;

  const Submit = async () => {
    if(!valid) { return; }

    setSubmitting(true);
    setError(undefined);

    try {
      await accountsStore.SendFunds({
        recipient: !recipientAddress ? customRecipientAddress : recipientAddress,
        ether: amount
      });

      rootStore.SetToastMessage("Funds transferred successfully");
      navigate("/accounts");
    } catch (error) {
      rootStore.Log(error, true);
      setSubmitting(false);
      setError(error.toString());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="form-container">
        <form onSubmit={() => {}}>
          <div className="form-header">
            Transfer Funds
          </div>
          <div className="form-content">
            { !error ? null : <Text mb="md" color="red" ta="center">Something went wrong, please try again</Text> }
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
                  className={S("input__fz-sm", "input__placeholder-fz-sm")}
                />
            }
            <NumberInput
              error={!amount ? true : (insufficientFunds ? "Insufficient Funds" : undefined)}
              mb="md"
              label="Amount"
              description={
                <Group gap={0}>
                  <Text fz={12} fw={500} mr={5}>Available Balance:</Text>
                  <ImageIcon icon={FundsIcon} className={S("icon", "icon--small", "icon--faded")} />
                  <Text fz={12} fw={600}>{accountsStore.currentAccount.balance || "0.0"}</Text>
                </Group>
              }
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
            <Group justify="right" wrap="nowrap">
              <Button
                variant="default"
                type="button"
                component={Link}
                to="/accounts"
                h={40}
                w={150}
              >
                Cancel
              </Button>
              <Button
                h={40}
                disabled={!valid}
                loading={submitting}
                type="button"
                w={150}
                onClick={Submit}
              >
                Submit
              </Button>
            </Group>
          </div>
        </form>
      </div>
    </div>
  );
});


export default TransferForm;
