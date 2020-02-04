import "../static/stylesheets/login.scss";

import React from "react";
import PropTypes from "prop-types";
import {Modal} from "elv-components-js";
import {Form} from "elv-components-js";

class LoginModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
    };

    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
  }

  HandleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async HandleSubmit() {
    await this.props.Submit(this.state.password);
  }

  render() {
    return (
      <Modal
        closable={!this.props.prompt}
        OnClickOutside={this.props.Close}
        className="login-modal"
      >
        <Form
          legend={"Enter your password to unlock this account"}
          cancelPath="/accounts"
          cancelText={this.props.prompt ? "Switch Account" : "Cancel"}
          OnCancel={this.props.Close}
          OnSubmit={this.HandleSubmit}
          OnComplete={this.props.Close}
        >
          <div className="form-content">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              value={this.state.password}
              autoFocus
              onChange={this.HandleInputChange}
            />
          </div>
        </Form>
      </Modal>
    );
  }
}

LoginModal.propTypes = {
  prompt: PropTypes.bool,
  address: PropTypes.string.isRequired,
  Submit: PropTypes.func.isRequired,
  Close: PropTypes.func
};

export default LoginModal;
