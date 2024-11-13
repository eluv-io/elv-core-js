import "../../static/stylesheets/login.scss";

import React, {useState} from "react";
import {Button, Group, Loader, Modal, PasswordInput, Title} from "@mantine/core";
import {observer} from "mobx-react";
import {Link, useNavigate} from "react-router-dom";
import {accountsStore} from "../../stores";
import {AccountSelector} from "../account/AccountMenu";
import OryForm from "../account/OryForm";
//import AccountDropdown from "../account/AccountDropdown";

const LoginModal = observer(({title, address, allowAccountSwitch, setUnlocking, Close}) => {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(undefined);
  const navigate = useNavigate();

  address = address || accountsStore.currentAccountAddress;
  const locked = !accountsStore.accounts[address]?.signer;

  const Submit = async () => {
    setUnlocking && setUnlocking(true);
    setSubmitting(true);
    setError(undefined);

    try {
      if(locked) {
        await accountsStore.UnlockAccount({
          address,
          password
        });
      } else {
        await accountsStore.SetCurrentAccount({
          address
        });
      }

      Close && Close();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setSubmitting(false);
      setError(error.toString());
    } finally {
      setUnlocking && setUnlocking(false);
    }
  };

  if(accountsStore.authenticating) {
    return (
      <Modal
        padding="xl"
        centered
        opened
        withCloseButton={false}
        closeOnClickOutside={false}
        //title={title || "Authenticating..."}
      >
        <Title order={3} ta="center" mb="xl" fw={500}>Authenticating...</Title>
        <Group justify="center">
          <Loader />
        </Group>
      </Modal>
    );
  }

  if(accountsStore.currentAccount?.type === "custodial") {
    return (
      <Modal
        padding="xl"
        centered
        opened
        onClose={() => {
          Close ? Close() : navigate("/accounts");
        }}
        title={title || "Log in"}
      >
        <OryForm />
      </Modal>
    );
  }

  return (
    <Modal
      padding="xl"
      centered
      opened
      onClose={() => {
        Close ? Close() : navigate("/accounts");
      }}
      title={title || "Enter your password to unlock your account"}
    >
      {
        !allowAccountSwitch ? null :
          <AccountSelector />
      }
      <form onSubmit={event => event.preventDefault()}>
        <PasswordInput
          data-autofocus
          mt={allowAccountSwitch ? "md" : 0}
          label="Password"
          value={password}
          error={error}
          onChange={event => setPassword(event.currentTarget.value)}
          onKeyDown={event => {
            if(event.key !== "Enter") { return; }

            Submit();
          }}
        />
        <Group justify="right" mt={50} wrap="nowrap">
          <Button
            fz="xs"
            variant="default"
            type="button"
            component={Link}
            to="/accounts"
            onClick={Close}
            w={150}
          >
            Switch Account
          </Button>
          <Button
            fz="sm"
            disabled={!password}
            opacity={submitting ? 0.5 : 1}
            styles={{
              root: {
                transition: "opacity 0.25s ease"
              }
            }}
            type="button"
            w={150}
            onClick={() => {
              if(submitting) { return; }

              Submit();
            }}
          >
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
});

export default LoginModal;
