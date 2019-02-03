import React from "react";
import Link from "react-router-dom/es/Link";
import connect from "react-redux/es/connect/connect";
import Redirect from "react-router/es/Redirect";
import Path from "path";
import Authenticate from "./Authenticate";
import RequestElement from "./components/RequestElement";

class TransferForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      recipient: "",
      selectedRecipient: "",
      manualEntry: false
    };

    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
  }

  componentDidMount() {
    // Set initial recipient address
    const availableAccounts = this.AvailableAccounts();
    const initialRecipient = (availableAccounts && availableAccounts.length > 0) ? availableAccounts[0].accountAddress : "";
    this.setState({
      recipient: initialRecipient,
      manualEntry: !initialRecipient
    });
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

  HandleSubmit(event) {
    event.preventDefault();

    this.setState({
      requestId: this.props.WrapRequest({
        todo: async () => {
          await this.props.SendFunds({
            accountManager: this.props.accounts.accountManager,
            recipient: this.state.recipient,
            ether: this.state.amount,
            client: this.props.client.client,
          });
        }
      })
    });
  }

  AvailableAccounts() {
    const currentAccountAddress = this.props.accounts.currentAccount && this.props.accounts.currentAccount.accountAddress.toLowerCase();

    return Object.values(this.props.accounts.accountManager.Accounts()).filter(
      account => account.accountAddress.toLowerCase() !== currentAccountAddress);
  }

  RecipientSelector() {
    let options = this.AvailableAccounts().map(account => {
      return (
        <option key={"account-selection-" + account.accountAddress} value={account.accountAddress}>
          { account.accountName }
        </option>
      );
    });

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

  Actions() {
    return (
      <RequestElement requestId={this.state.requestId} requests={this.props.requests}>
        <div className="actions-container">
          <Link to={Path.dirname(this.props.match.url)} className="action action-compact action-wide secondary">Cancel</Link>
          <input type="submit" className="action action-compact action-wide" value="Submit" />
        </div>
      </RequestElement>
    );
  }

  render() {
    const request = this.props.requests[this.state.requestId];
    if(request && request.completed) {
      return <Redirect push to="/accounts" />;
    }

    return (
      <form className="account-form main-content-container" onSubmit={this.HandleSubmit}>
        <fieldset>
          <legend>Transfer Funds</legend>
          <div className="form-content">
            <div className="labelled-input">
              <label htmlFor="recipient">Recipient</label>
              { this.RecipientSelector() }
            </div>

            <div className="labelled-input">
              <label htmlFor="recipient">Recipient Address</label>
              <input name="recipient" value={this.state.recipient} disabled={!this.state.manualEntry} onChange={this.HandleInputChange} />
            </div>

            <div className="labelled-input">
              <label htmlFor="amount">Amount</label>
              <input name="amount" type="number" step="0.0000001" value={this.state.amount} required={true} onChange={this.HandleInputChange} />
            </div>
          </div>

          { this.Actions() }

        </fieldset>
      </form>
    );
  }
}

export default connect(
  (state) => state
)(Authenticate(TransferForm));
