import React from "react";
import withRouter from "react-router/es/withRouter";
import {ElvCoreConsumer} from "./ElvCoreContext";
import Redirect from "react-router/es/Redirect";
import LoginModal from "./components/LoginModal";
import {UnlockAccount as Unlock} from "./actions/Accounts";

class EnforceLogin extends React.PureComponent {
  render() {
    if(this.props.redirect) {
      return <Redirect to="/accounts" />;
    } else if(this.props.showLoginModal) {
      return (
        <LoginModal
          login={true}
          address={this.props.currentAccount.address}
          Submit={(password) => this.props.actions.UnlockAccount({address: this.props.currentAccount.address, password})}
          Close={() => this.setState({showLoginModal: false})}
        />
      );
    } else {
      return this.props.children;
    }
  }
}

const UnlockAccount = (context) => {
  return async ({address, password}) => {
    await Unlock({context, address, password});
  };
};

const EnforceLoginContainer = ({context, props}) => {
  const actions = {
    UnlockAccount: UnlockAccount(context)
  };

  const currentAccount = context.accounts[context.currentAccount];
  const onAccountsPage = props.location.pathname.startsWith("/accounts");

  return (
    <EnforceLogin
      redirect={!currentAccount && !onAccountsPage}
      showLoginModal={!onAccountsPage && (currentAccount && !currentAccount.signer)}
      currentAccount={currentAccount}
      actions={actions}
      children={props.children}
    />
  );
};

export default withRouter(ElvCoreConsumer(EnforceLoginContainer));
