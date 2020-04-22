import React from "react";
import {Form} from "elv-components-js";
import {Redirect} from "react-router";
import {inject, observer} from "mobx-react";

@inject("accountsStore")
@inject("profilesStore")
@observer
class TransferForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ether: 0,
      recipient: Object.keys(this.props.accountsStore.accounts)[0],
      manualEntry: Object.keys(this.props.accountsStore.accounts).length === 0
    };

    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
  }

  HandleInputChange(event) {
    if(event.target.name === "selectedRecipient") {
      if(event.target.value === "other") {
        this.setState({
          recipient: "",
          manualEntry: true
        });
      } else {
        this.setState({
          recipient: event.target.value,
          manualEntry: false
        });
      }
    }

    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async HandleSubmit() {
    await this.props.accountsStore.SendFunds({
      recipient: this.state.recipient,
      ether: this.state.ether
    });
  }

  RecipientSelector() {
    let options = Object.values(this.props.accountsStore.accounts)
      .map(account => {
        const profile = this.props.profilesStore.profiles[account.address];
        return (
          <option key={"account-selection-" + account.address} value={account.address}>
            {`${profile.metadata.public.name || account.address} (${account.balance})`}
          </option>
        );
      });

    options.push(
      <option key={"account-selection-other"} value="other">
        { "[Other]" }
      </option>
    );

    return (
      <select className="recipient-select" name="selectedRecipient" value={this.state.selectedRecipient} onChange={this.HandleInputChange} required={true}>
        { options }
      </select>
    );
  }

  render() {
    if(this.state.completed) {
      return <Redirect to="/accounts" />;
    }

    return (
      <div className="page-content">
        <Form
          legend="Transfer Funds"
          redirectPath="/accounts"
          OnSubmit={this.HandleSubmit}
          OnError={this.HandleError}
        >
          <div className="form-content">
            <label htmlFor="recipient">Recipient</label>
            { this.RecipientSelector() }

            <label htmlFor="recipient">Recipient Address</label>
            <input name="recipient" value={this.state.recipient} disabled={!this.state.manualEntry} onChange={this.HandleInputChange} />

            <label htmlFor="ether">Ether</label>
            <input name="ether" type="number" step="0.0000001" value={this.state.ether} required={true} onChange={this.HandleInputChange} />
          </div>
        </Form>
      </div>
    );
  }
}

export default TransferForm;
