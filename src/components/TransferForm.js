import React from "react";
import Form from "elv-components-js/src/components/Form";
import Redirect from "react-router/es/Redirect";

class TransferForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ether: 0,
      recipient: Object.keys(this.props.accounts)[0],
      manualEntry: Object.keys(this.props.accounts).length === 0,
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
        loading: true
      }
    });

    await this.props.actions.Submit({
      recipient: this.state.recipient,
      ether: this.state.ether
    });

    this.setState({
      completed: true
    });
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
    let options = Object.values(this.props.accounts)
      .map(account => (
        <option key={"account-selection-" + account.address} value={account.address}>
          { account.address }
        </option>
      ));

    options.push(
      <option key={"account-selection-other"} value="other">
        { "[Other]" }
      </option>
    );

    return (
      <select name="selectedRecipient" value={this.state.selectedRecipient} onChange={this.HandleInputChange} required={true}>
        { options }
      </select>
    );
  }

  FormContent() {
    return (
      <div className="form-content">
        <label htmlFor="recipient">Recipient</label>
        { this.RecipientSelector() }

        <label htmlFor="recipient">Recipient Address</label>
        <input name="recipient" value={this.state.recipient} disabled={!this.state.manualEntry} onChange={this.HandleInputChange} />

        <label htmlFor="ether">Ether</label>
        <input name="ether" type="number" step="0.0000001" value={this.state.ether} required={true} onChange={this.HandleInputChange} />
      </div>
    );
  }

  render() {
    if(this.state.completed) {
      return <Redirect to="/accounts" />;
    }

    return (
      <div className="page-container">
        <Form
          legend="Transfer Funds"
          formContent={this.FormContent()}
          status={this.state.status}
          OnSubmit={this.HandleSubmit}
          OnError={this.HandleError}
        />
      </div>
    );
  }
}

export default TransferForm;
