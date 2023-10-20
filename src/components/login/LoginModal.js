import "../../static/stylesheets/login.scss";

import React, {useState} from "react";
import {Button, Group, Modal, PasswordInput} from "@mantine/core";
import {observer} from "mobx-react";
import {Link, useNavigate} from "react-router-dom";
import {accountsStore} from "../../stores";
import AccountDropdown from "../account/AccountDropdown";

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
      <form onSubmit={() => {}}>
        {
          !allowAccountSwitch ? null :
            <AccountDropdown />
        }
        <PasswordInput
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
        <Group position="right" mt={50} noWrap>
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
            loading={submitting}
            type="button"
            w={150}
            onClick={Submit}
          >
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
});

export default LoginModal;
