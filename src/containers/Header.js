import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Header from "../components/Header";
import {GetAccountBalance} from "../actions/Accounts";

class HeaderContainer extends React.Component {
  constructor(props) {
    super(props);

    this.ToggleHeader = this.ToggleHeader.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const thisCurrent = this.props.context.accounts[this.props.context.currentAccount];
    const nextCurrent = nextProps.context.accounts[nextProps.context.currentAccount];

    return !(
      thisCurrent === nextCurrent &&
      this.props.context.showHeader === nextProps.context.showHeader
    );
  }

  ToggleHeader(show) {
    this.props.context.UpdateContext({showHeader: show});
  }

  render() {
    const currentAccount = this.props.context.accounts[this.props.context.currentAccount];

    if(currentAccount && !currentAccount.balance) {
      GetAccountBalance({context: this.props.context, address: this.props.context.currentAccount});
    }

    return (
      <Header showHeader={this.props.context.showHeader} ToggleHeader={this.ToggleHeader} currentAccount={currentAccount} />
    );
  }
}

export default ElvCoreConsumer(HeaderContainer);
