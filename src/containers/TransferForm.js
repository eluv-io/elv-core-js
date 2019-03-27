import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import TransferForm from "../components/TransferForm";
import {SendFunds} from "../actions/Accounts";
import {UpdateProfiles} from "../actions/Profiles";

class TransferFormContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.Submit = this.Submit.bind(this);
  }

  async Submit({recipient, ether}) {
    await SendFunds({context: this.props.context, recipient, ether});
  }

  componentDidMount() {
    UpdateProfiles({context: this.props.context});
  }

  render() {
    // Filter out current account
    let accounts = {};
    Object.keys(this.props.context.accounts)
      .filter(address => address !== this.props.context.currentAccount)
      .forEach(address => accounts[address] = this.props.context.accounts[address]);

    return (
      <TransferForm accounts={accounts} currentAccount={this.props.context.currentAccount} Submit={this.Submit} />
    );
  }
}

export default ElvCoreConsumer(TransferFormContainer);
