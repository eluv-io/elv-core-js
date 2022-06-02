import React from "react";
import {Redirect, withRouter} from "react-router";
import LoginModal from "./components/LoginModal";
import {inject, observer} from "mobx-react";
import {LoadingElement} from "elv-components-js";
import {AppRoutes} from "./Routes";

@inject("accountsStore")
@inject("rootStore")
@observer
class EnforceLogin extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      unlocking: false
    };
  }

  render() {
    const currentAccount = this.props.accountsStore.currentAccount;

    const loginPaths = AppRoutes
      .map(({path}) => "/" + path.split("/")[1])
      .filter(p => p !== "/accounts");

    const accountRequired =
      !!(this.props.location.pathname &&
      loginPaths.find(path => this.props.location.pathname.startsWith(path)));
      
    if(!accountRequired) {
      return this.props.children;
    } else if(!currentAccount || currentAccount.balance < 0.1) {
      return <Redirect to="/accounts"/>;
    } else if(this.state.unlocking || (!currentAccount.signer&& !currentAccount.isMetaAccount)) {
      return (
        <LoginModal
          key="password-prompt"
          legend={"Enter your password to unlock this account"}
          prompt={true}
          fields={[{name: "password", label: "Password", type: "password"}]}
          Submit={
            async ({password}) => {
              try {
                this.setState({unlocking: true});

                await this.props.accountsStore.UnlockAccount({
                  address: currentAccount.address,
                  password
                });
              } finally {
                this.setState({unlocking: false});
              }
            }
          }
        />
      );
    // Temporarily disabled
    // eslint-disable-next-line no-constant-condition
    } else if(false && !currentAccount.tenantId) {
      return (
        <LoginModal
          key="tenant-id-prompt"
          legend={"This account is not associated with a tenant. Please enter your tenant ID to proceed."}
          prompt={true}
          fields={[{name: "tenantId", label: "Tenant ID", placeholder: "iten..."}]}
          Submit={async ({tenantId}) => await this.props.accountsStore.SetTenantId({id: tenantId})}
        />
      );
    } else {
      return (
        <LoadingElement
          key={`login-protected-${this.props.accountsStore.currentAccountAddress}`}
          loading={!this.props.rootStore.signerSet}
          fullPage={true}
        >
          { this.props.children }
        </LoadingElement>
      );
    }
  }
}

export default withRouter(EnforceLogin);
