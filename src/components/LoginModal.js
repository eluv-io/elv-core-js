import "../static/stylesheets/login.scss";

import React from "react";
import PropTypes from "prop-types";
import {Modal} from "elv-components-js";
import {Form} from "elv-components-js";
import AccountDropdown from "./AccountDropdown";

class LoginModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {};

    props.fields.map(({name}) => this.state[name] = "");

    this.HandleInputChange = this.HandleInputChange.bind(this);
    this.HandleSubmit = this.HandleSubmit.bind(this);
  }

  HandleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async HandleSubmit() {
    await this.props.Submit(this.state);
  }

  render() {
    return (
      <Modal
        closable={!this.props.prompt}
        OnClickOutside={this.props.Close}
        className="login-modal"
      >
        <Form
          legend={this.props.legend}
          cancelPath="/accounts"
          cancelText={this.props.prompt ? "Switch Account" : "Cancel"}
          OnCancel={this.props.Close}
          OnSubmit={this.HandleSubmit}
          OnComplete={this.props.Close}
        >
          <div className="form-content">
            {
              !this.props.prompt ? null :
                (
                  <React.Fragment>
                    <label>Account</label>
                    <AccountDropdown />
                  </React.Fragment>
                )
            }

            {
              this.props.fields.map(({label, name, type, placeholder}) =>
                <React.Fragment key={`login-modal-field-${name}`}>
                  <label htmlFor={name}>{label}</label>
                  <input
                    name={name}
                    type={type}
                    value={this.state[name]}
                    placeholder={placeholder}
                    autoFocus
                    onChange={this.HandleInputChange}
                  />
                </React.Fragment>
              )
            }
          </div>
        </Form>
      </Modal>
    );
  }
}

LoginModal.propTypes = {
  legend: PropTypes.string.isRequired,
  prompt: PropTypes.bool,
  fields: PropTypes.array.isRequired,
  Submit: PropTypes.func.isRequired,
  Close: PropTypes.func
};

export default LoginModal;
