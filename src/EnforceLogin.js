import React from "react";
import withRouter from "react-router/es/withRouter";
import {ElvCoreConsumer} from "./ElvCoreContext";
import Redirect from "react-router/es/Redirect";
import LoginModal from "./components/LoginModal";
import {UnlockAccount} from "./actions/Accounts";

class EnforceLogin extends React.PureComponent {
  render() {
    const currentAccount = this.props.context.accounts[this.props.context.currentAccount];
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
            async (password) => await UnlockAccount({
              context: this.props.context,
              address: currentAccount.address,
              password
            })
          }
        />
      );
    } else {
      return this.props.children;
    }
  }
}

export default withRouter(ElvCoreConsumer(EnforceLogin));
