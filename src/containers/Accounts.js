import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Accounts from "../components/Accounts";
import {GetAccountBalance, RemoveAccount as Remove} from "../actions/Accounts";
import {UnlockAccount as Unlock} from "../actions/Accounts";

class AccountsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.UnlockAccount = this.UnlockAccount.bind(this);
    this.RemoveAccount = this.RemoveAccount.bind(this);
  }

  componentDidMount() {
    Object.keys(this.props.context.accounts).forEach(address => {
      if (!this.props.context.accounts[address].balance) {
        GetAccountBalance({context: this.props.context, address});
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    return !(
      this.props.context.accounts === nextProps.context.accounts &&
      this.props.context.currentAccount === nextProps.context.currentAccount
    );
  }

  async UnlockAccount({address, password}) {
    await Unlock({context: this.props.context, address, password});
  }

  RemoveAccount(address) {
    Remove({context: this.props.context, address});
  }

  render() {
    return (
      <Accounts
        accounts={this.props.context.accounts}
        currentAccount={this.props.context.currentAccount}
        UnlockAccount={this.UnlockAccount}
        RemoveAccount={this.RemoveAccount}
      />
    );
  }
}

export default ElvCoreConsumer(AccountsContainer);
