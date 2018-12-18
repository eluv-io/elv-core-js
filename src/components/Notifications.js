import React from "react";
import connect from "react-redux/es/connect/connect";
import { ClearNotifications } from "../actions/Notifications";

class Notifications extends React.Component {
  render() {
    if(this.props.notifications.errorMessage !== "") {
      return (
        <div className="notification-container">
          <div className="notification-message error-message-container">
            { this.props.notifications.errorMessage }
            <div className="clear-notification" onClick={() => this.props.dispatch(ClearNotifications())}>X</div>
          </div>
        </div>
      );
    } else if(this.props.notifications.notificationMessage !== "") {
      return (
        <div className="notification-container">
          <div className="notification-message-container">
            { this.props.notifications.notificationMessage }
            <div className="clear-notification" onClick={() => this.props.dispatch(ClearNotifications())}>X</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="notification-container" />
      );
    }
  }
}

export default connect(
  (state) => {
    return { notifications: state.notifications };
  }
)(Notifications);
