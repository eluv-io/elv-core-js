import React from "react";
import {Redirect, withRouter} from "react-router";
import LoginModal from "./components/LoginModal";
import {inject, observer} from "mobx-react";
import {LoadingElement} from "elv-components-js";

@inject("accounts")
@inject("root")
@observer
class EnforceLogin extends React.PureComponent {
  render() {
    const currentAccount = this.props.accounts.currentAccount;
    const onAccountsPage = this.props.location.pathname.startsWith("/accounts");

    if(onAccountsPage) {
      return this.props.children;
    } else if(!currentAccount) {
      return <Redirect to="/accounts"/>;
    } else if(!currentAccount.signer) {
      return (
        <LoginModal
          prompt={true}
          address={currentAccount.address}
          Submit={
            async (password) => await this.props.accounts.UnlockAccount({
              address: currentAccount.address,
              password
            })
          }
        />
      );
    } else {
      return (
        <LoadingElement
          loading={!this.props.root.signerSet}
          fullPage={true}
        >
          { this.props.children }
        </LoadingElement>
      );
    }
  }
}

export default withRouter(EnforceLogin);
