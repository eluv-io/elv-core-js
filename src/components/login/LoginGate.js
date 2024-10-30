import {observer} from "mobx-react";
import React, {useState} from "react";
import {accountsStore} from "../../stores";
import {Navigate} from "react-router";
import LoginModal from "./LoginModal";

const LoginGate = observer(({children}) => {
  const [unlocking, setUnlocking] = useState(false);
  const currentAccount = accountsStore.currentAccount;

  // No account or insufficient balance
  if(!currentAccount || currentAccount.balance < 0.1) {
    return <Navigate to="/accounts"/>;
  } else if(unlocking || !currentAccount.signer) {
    return (
      <LoginModal
        address={currentAccount.address}
        allowAccountSwitch
        setUnlocking={setUnlocking}
      />
    );
  }

  // Enforce tenant ID - Temporarily disabled
  /*
    else if(false && !currentAccount.tenantContractIda) {
      return (
        <LoginModal
          key="tenant-id-prompt"
          legend={"This account is not associated with a tenant. Please enter your tenant ID to proceed."}
          prompt={true}
          fields={[{name: "tenantContractId", label: "Tenant Contract ID", placeholder: "iten..."}]}
          Submit={async ({tenantContractId}) => await accountsStore.SetTenantContractId({id: tenantContractId})}
        />
      );
    }

   */

  return children;
});

export default LoginGate;
