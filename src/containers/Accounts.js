import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Accounts from "../components/Accounts";
import {RemoveAccount as Remove} from "../actions/Accounts";
import {UnlockAccount as Unlock} from "../actions/Accounts";
import {UpdateProfiles} from "../actions/Profiles";

class AccountsContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.UnlockAccount = this.UnlockAccount.bind(this);
    this.RemoveAccount = this.RemoveAccount.bind(this);
  }

  componentDidMount() {
    UpdateProfiles({context: this.props.context});
  }

  async UnlockAccount({address, password}) {
    await Unlock({context: this.props.context, address, password});
    UpdateProfiles({context: this.props.context});
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
