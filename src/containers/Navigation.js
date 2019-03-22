import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Navigation from "../components/Navigation";
import withRouter from "react-router/es/withRouter";

class NavigationContainer extends React.Component {
  shouldComponentUpdate(nextProps) {
    const thisCurrent = this.props.context.accounts[this.props.context.currentAccount] || {};
    const nextCurrent = nextProps.context.accounts[nextProps.context.currentAccount] || {};

    return !(
      this.props.context.currentAccount === nextProps.context.currentAccount &&
      thisCurrent.signer === nextCurrent.signer &&
      this.props.location.pathname.match(/^\/apps\/.+$/) === nextProps.location.pathname.match(/^\/apps\/.+$/)
    );
  }

  render() {
    if(this.props.location && this.props.location.pathname.match(/^\/apps\/.+$/)) {
      return null;
    }

    const currentAccount = this.props.context.accounts[this.props.context.currentAccount];

    return (
      <Navigation unlocked={currentAccount && !!currentAccount.signer} />
    );
  }
}

export default withRouter(ElvCoreConsumer(NavigationContainer));
