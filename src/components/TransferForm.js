import React from "react";
import {Form} from "elv-components-js";
import Redirect from "react-router/es/Redirect";
import {inject, observer} from "mobx-react";

@inject("accounts")
@inject("profiles")
@observer
class TransferForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ether: 0,
      recipient: Object.keys(this.props.accounts.accounts)[0],
      manualEntry: Object.keys(this.props.accounts.accounts).length === 0,
      status: {
        loading: false,
        error: false,
        errorMessage: ""
      }
    };

    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
    this.HandleError = this.HandleError.bind(this);
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
    this.setState({
      status: {
        loading: true,
        error: false,
        errorMessage: ""
      }
    });

    try {
      await this.props.accounts.SendFunds({
        recipient: this.state.recipient,
        ether: this.state.ether
      });

      this.setState({
        status: {
          completed: true,
          loading: false,
          error: false,
          errorMessage: ""
        }
      });
    } catch (error) {
      this.setState({
        status: {
          loading: false,
          error: true,
          errorMessage: error.message
        }
      });
    }
  }

  HandleError(error) {
    this.setState({
      status: {
        loading: false,
        error: true,
        errorMessage: error.message
      }
    });
  }

  RecipientSelector() {
    let options = Object.values(this.props.accounts.accounts)
      .map(account => {
        const profile = this.props.profiles.profiles[account.address];
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
          status={this.state.status}
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
