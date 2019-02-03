import React from "react";
import Link from "react-router-dom/es/Link";
import connect from "react-redux/es/connect/connect";
import Redirect from "react-router/es/Redirect";
import RadioSelect from "./components/RadioSelect";
import RequestElement from "./components/RequestElement";

class AccountForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accountName: "",
      credentialType: "privateKey",
      privateKey: "",
      encryptedPrivateKey: "",
      mnemonic: "",
      password: "",
    };

    this.GenerateMnemonic = this.GenerateMnemonic.bind(this);
    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
  }

  GenerateMnemonic() {
    this.setState({
      mnemonic: this.props.accounts.accountManager.elvWallet.GenerateMnemonic()
    });
  }

  HandleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  HandleSubmit(event) {
    event.preventDefault();

    this.setState({
      requestId: this.props.WrapRequest({
        todo: async () => {
          await this.props.AddAccount({
            client: this.props.client.client,
            accountManager: this.props.accounts.accountManager,
            accountName: this.state.accountName,
            privateKey: this.state.privateKey,
            encryptedPrivateKey: this.state.encryptedPrivateKey,
            mnemonic: this.state.mnemonic,
            password: this.state.password
          });
        }
      })
    });
  }

  Actions() {
    return (
      <RequestElement requestId={this.state.requestId} requests={this.props.requests}>
        <div className="actions-container">
          <Link to="/accounts" className="action action-compact action-wide secondary">Cancel</Link>
          <input type="submit" className="action action-compact action-wide" value="Submit" />
        </div>
      </RequestElement>
    );
  }

  Credentials() {
    switch(this.state.credentialType) {
      case "privateKey":
        return (
          <div className="labelled-input">
            <label htmlFor="privateKey">Private Key</label>
            <input
              name="privateKey"
              value={this.state.privateKey}
              onChange={this.HandleInputChange}
            />
          </div>
        );
      case "encryptedPrivateKey":
        return (
          <div className="labelled-input">
            <label className="textarea-label" htmlFor="encryptedPrivateKey">Encrypted Private Key</label>
            <textarea
              name="encryptedPrivateKey"
              value={this.state.encryptedPrivateKey}
              onChange={this.HandleInputChange}
            />
          </div>
        );
      case "mnemonic":
        return (
          <div>
            <div className="labelled-input">
              <label htmlFor="generateMnemonic">Generate Mnemonic</label>
              <div className="input-container">
                <div className="actions-container inline-actions-container">
                  <input
                    className="action action-compact action-wide"
                    type="button"
                    name="generateMnemonic"
                    value="Generate Mnemonic"
                    onClick={this.GenerateMnemonic}
                  />
                </div>
              </div>
            </div>
            <div className="labelled-input">
              <label className="textarea-label" htmlFor="encryptedPrivateKey">Mnemonic</label>
              <textarea
                className="mnemonic-input"
                name="mnemonic"
                value={this.state.mnemonic}
                onChange={this.HandleInputChange}
              />
            </div>
          </div>
        );
    }

    return null;
  }

  render() {
    const request = this.props.requests[this.state.requestId];
    if(request && request.completed) {
      return <Redirect push to="/accounts" />;
    }

    return (
      <form className="account-form main-content-container" onSubmit={this.HandleSubmit}>
        <fieldset>
          <legend>Add Account</legend>
          <div className="form-content">
            <div className="labelled-input">
              <label htmlFor="accountName">Account Name</label>
              <input name="accountName" value={this.state.accountName} onChange={this.HandleInputChange} />
            </div>

            <RadioSelect
              name="credentialType"
              label="Credential Type"
              options={
                [
                  ["Private Key", "privateKey"],
                  ["Encrypted Private Key", "encryptedPrivateKey"],
                  ["Mnemonic", "mnemonic"]
                ]
              }
              selected={this.state.credentialType}
              onChange={this.HandleInputChange}
            />

            { this.Credentials() }

            <div className="labelled-input">
              <label htmlFor="password">Password</label>
              <input name="password" type="password" value={this.state.password} required={true} onChange={this.HandleInputChange} />
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
)(AccountForm);
