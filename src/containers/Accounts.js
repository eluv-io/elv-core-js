import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Accounts from "../components/Accounts";
import {RemoveAccount as Remove} from "../actions/Accounts";
import {UnlockAccount as Unlock} from "../actions/Accounts";
import {UpdateProfiles, UserMetadata, UserProfileImage} from "../actions/Profiles";

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
    const balance = parseFloat(this.props.context.accounts[this.props.context.currentAccount].balance);

    if(balance > 0.1) {
      await UserProfileImage({context: this.props.context});
      await UserMetadata({context: this.props.context});
    }
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
