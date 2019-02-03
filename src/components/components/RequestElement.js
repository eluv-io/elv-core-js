import React from "react";
import {BallPulse} from "./AnimatedIcons";

class RequestElement extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const request = this.props.requests[this.props.requestId];
    if((request && request.loading) || (this.props.render && !request)) {
      return (
        <div className="actions-container loading">
          <div className="action-loading">
            <BallPulse />
          </div>
        </div>
      );
    } else {
      if(this.props.render) {
        return this.props.render();
      } else {
        return this.props.children;
      }
    }
  }
}

export default RequestElement;
