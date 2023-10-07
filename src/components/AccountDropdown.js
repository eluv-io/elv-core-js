import "../static/stylesheets/header.scss";

import React, {forwardRef, useState} from "react";
import {
  Balance,
  CroppedIcon
} from "elv-components-js";
import {observer} from "mobx-react";

import DefaultAccountImage from "../static/icons/User.svg";
import {accountsStore} from "../stores";
import {Group, Modal, Select, Text, UnstyledButton} from "@mantine/core";

const Account = forwardRef(({
  name,
  address,
  imageUrl,
  balance,
  ...others
}, ref) => {
  return (
    <Group ref={ref} noWrap p="xs" {...others}>
      <CroppedIcon
        icon={imageUrl || DefaultAccountImage}
        alternateIcon={DefaultAccountImage}
        label={"Profile Image"}
        className="header-profile-image"
      />
      <div>
        <Text fz="xs">{ name || address }</Text>
        <Group noWrap>
          <Balance balance={balance} className="header-account-balance"/>
        </Group>
      </div>
    </Group>
  );
});

const AccountDropdown = observer(({onChange}) => {
  const accounts = accountsStore.sortedAccounts
    .map(address => {
      const account = accountsStore.accounts[address];

      return {
        label: account.name || account.address,
        value: account.address,
        name: account.name,
        address: account.address,
        balance: account.balance,
        imageUrl: accountsStore.ResizeImage(account.imageUrl, 200)
      };
    });

  return (
    <Select
      searchable
      label="Account"
      data={accounts}
      value={accountsStore.currentAccountAddress}
      onChange={async address => {
        await accountsStore.SetCurrentAccount({address: address});

        onChange && onChange(address);
      }}
      itemComponent={Account}
      withinPortal
    />
  );
});

const AccountSelection = observer(({Close}) => {
  return (
    <Modal centered opened onClose={Close} title="Select Account">
      <AccountDropdown onChange={Close} />
    </Modal>
  );
});

export const HeaderAccount = observer(() => {
  const [showAccountSelectionModal, setShowAccountSelectionModal] = useState(false);
  const account = accountsStore.currentAccount;

  if(!account) {
    return <Account name="Not Logged In" />;
  }

  return (
    <>
      {
        !showAccountSelectionModal ? null :
          <AccountSelection Close={() => setShowAccountSelectionModal(false)} />
      }
      <UnstyledButton onClick={() => setShowAccountSelectionModal(true)}>
        <Account
          name={account.name}
          address={account.address}
          balance={account.balance}
          imageUrl={accountsStore.ResizeImage(account.imageUrl, 200)}
        />
      </UnstyledButton>
    </>
  );
});

export default AccountDropdown;
