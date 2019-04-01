import React from "react";
import Form from "elv-components-js/src/components/Form";
import Action from "elv-components-js/src/components/Action";
import RadioSelect from "elv-components-js/src/components/RadioSelect";

class AccountForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: {
        loading: false,
        error: false,
        errorMessage: ""
      },
      credentialType: "privateKey",
      privateKey: "",
      encryptedPrivateKey: "",
      mnemonic: "",
      password: ""
    };

    this.FormContent = this.FormContent.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
    this.HandleError = this.HandleError.bind(this);
    this.HandleInputChange = this.HandleInputChange.bind(this);
  }

  HandleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async HandleSubmit() {
    this.setState({status: {loading: true}});

    await this.props.Submit({
      credentialType: this.state.credentialType,
      privateKey: this.state.privateKey,
      encryptedPrivateKey: this.state.encryptedPrivateKey,
      mnemonic: this.state.mnemonic,
      password: this.state.password
    });

    this.setState({status: {loading: false, completed: true}});
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

  Credentials() {
    switch(this.state.credentialType) {
      case "privateKey":
        return [
          <label key="credential-label" htmlFor="privateKey">Private Key</label>,
          <input
            key="credential-input"
            name="privateKey"
            value={this.state.privateKey}
            onChange={this.HandleInputChange}
          />
        ];
      case "encryptedPrivateKey":
        return [
          <label key="credential-label" className="align-top" htmlFor="encryptedPrivateKey">Encrypted Private Key</label>,
          <textarea
            key="credential-input"
            name="encryptedPrivateKey"
            value={this.state.encryptedPrivateKey}
            onChange={this.HandleInputChange}
          />
        ];
      case "mnemonic":
        return [
          <label key="generate-mnemonic-label" htmlFor="generateMnemonic">Generate Mnemonic</label>,
          <div key="generate-mnemonic-button" className="actions-container">
            <Action onClick={() => this.setState({mnemonic: this.props.GenerateMnemonic()})}>
              Generate Mnemonic
            </Action>
          </div>,
          <label key="credential-label" className="align-top" htmlFor="encryptedPrivateKey">Mnemonic</label>,
          <textarea
            key="credential-input"
            className="mnemonic-input"
            name="mnemonic"
            value={this.state.mnemonic}
            onChange={this.HandleInputChange}
          />
        ];
    }

    return null;
  }

  FormContent() {
    return (
      <div className="form-content">
        <label htmlFor="credentialType">Credential Type</label>
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

        <label htmlFor="password">Password</label>
        <input name="password" type="password" value={this.state.password} required={true} onChange={this.HandleInputChange} />
      </div>
    );
  }

  render() {
    return (
      <div className="page-content">
        <Form
          formContent={this.FormContent()}
          legend="Add Account"
          status={this.state.status}
          OnSubmit={this.HandleSubmit}
          OnError={this.HandleError}
          redirectPath="/accounts/switch"
          cancelPath="/accounts/switch"
        />
      </div>
    );
  }
}

export default AccountForm;
