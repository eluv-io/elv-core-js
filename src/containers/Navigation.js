import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Navigation from "../components/Navigation";
import withRouter from "react-router/es/withRouter";

class NavigationContainer extends React.PureComponent {
  render() {
    if(this.props.location && this.props.location.pathname.match(/^\/apps\/.+$/)) {
      return null;
    }

    const currentAccount = this.props.context.accounts[this.props.context.currentAccount];

    return (
      <Navigation unlocked={!!currentAccount && !!currentAccount.signer} />
    );
  }
}

export default withRouter(ElvCoreConsumer(NavigationContainer));
