import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Header from "../components/Header";
import {GetAccountBalance} from "../actions/Accounts";
import {PublicProfileInfo} from "../actions/Profiles";

class HeaderContainer extends React.Component {
  constructor(props) {
    super(props);

    this.ToggleHeader = this.ToggleHeader.bind(this);
  }

  componentDidMount() {
    if(this.props.context.currentAccount) {
      PublicProfileInfo({context: this.props.context, address: this.props.context.currentAccount});
      GetAccountBalance({context: this.props.context, address: this.props.context.currentAccount});
    }
  }

  // Update when account changes
  componentDidUpdate(prevProps) {
    if(this.props.context.currentAccount && (prevProps.context.currentAccount !== this.props.context.currentAccount)) {
      PublicProfileInfo({context: this.props.context, address: this.props.context.currentAccount});
    }
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

    return (
      <Header showHeader={this.props.context.showHeader} ToggleHeader={this.ToggleHeader} account={currentAccount} />
    );
  }
}

export default ElvCoreConsumer(HeaderContainer);
