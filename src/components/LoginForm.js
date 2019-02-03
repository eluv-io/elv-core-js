import React from "react";
import Link from "react-router-dom/es/Link";
import connect from "react-redux/es/connect/connect";
import Redirect from "react-router/es/Redirect";
import RequestElement from "./components/RequestElement";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    const accountAddress = this.props.match.params.accountAddress;
    const account = this.props.accounts.activeAccounts[accountAddress];

    this.state = {
      account,
      password: "",
      redirectLocation: this.props.accounts.savedLocation || "/accounts"
    };

    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
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
          await this.props.LogIn({
            client: this.props.client.client,
            accountManager: this.props.accounts.accountManager,
            accountAddress: this.state.account.accountAddress,
            encryptedPrivateKey: this.state.account.encryptedPrivateKey,
            password: this.state.password,
          });
        }
      })
    });
  }

  Actions() {
    return (
      <RequestElement requestId={this.state.requestId} requests={this.props.requests}>
        <div className="actions-container">
          <Link to="/accounts" className="action action-compact action-wide secondary">Change Account</Link>
          <input type="submit" className="action action-compact action-wide" value="Submit" />
        </div>
      </RequestElement>
    );
  }

  render() {
    const request = this.props.requests[this.state.requestId];
    if(request && request.completed) {
      return <Redirect push to={this.state.redirectLocation} />;
    }

    return (
      <form className="account-form main-content-container" onSubmit={this.HandleSubmit}>
        <fieldset>
          <legend>{"Log in as " + this.state.account.accountName}</legend>
          <div className="form-content">
            <div className="labelled-input">
              <label htmlFor="password">Password</label>
              <input name="password" type="password" value={this.state.password} onChange={this.HandleInputChange}/>
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
)(LoginForm);
