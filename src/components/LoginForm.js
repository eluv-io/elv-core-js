import React from "react";
import Link from "react-router-dom/es/Link";
import { LogIn } from "../actions/Accounts";
import connect from "react-redux/es/connect/connect";
import { BallPulse } from "./AnimatedIcons";
import Redirect from "react-router/es/Redirect";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    const accountAddress = this.props.match.params.accountAddress;
    const account = Object.values(this.props.accounts.activeAccounts)
      .find(accountInfo => accountInfo.accountAddress.toLowerCase() === accountAddress.toLowerCase());

    this.state = {
      account,
      password: "",
      redirect: false
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

    const requestId = this.props.dispatch(
      LogIn({
        accountManager: this.props.accounts.accountManager,
        accountName: this.state.account.accountName,
        encryptedPrivateKey: this.state.account.encryptedPrivateKey,
        password: this.state.password,
      })
    );

    this.setState({
      requestId
    });
  }

  componentDidUpdate() {
    if(!this.state.requestId) { return; }

    const request = this.props.requests[this.state.requestId];

    if(request && !request.pending) {
      this.setState({
        requestId: undefined
      });

      if(request.completed) {
        this.setState({
          redirect: true
        });
      }
    }
  }

  Actions() {
    if(this.state.requestId) {
      return (
        <div className="actions-container loading">
          <div className="action-loading">
            <BallPulse />
          </div>
        </div>
      );
    } else {
      return (
        <div className="actions-container">
          <Link to="/accounts" className="action action-compact action-wide secondary">Change Account</Link>
          <input type="submit" className="action action-compact action-wide" value="Submit" />
        </div>
      );
    }
  }

  render() {
    if(!this.state.account || this.state.redirect) {
      return <Redirect push to="/accounts" />;
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
