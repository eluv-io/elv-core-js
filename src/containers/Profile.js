import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Profile from "../components/Profile";
import {
  UserMetadata,
  ReplaceUserMetadata,
  DeleteUserMetadata,
  UserProfileImage,
  UpdateUserProfileImage
} from "../actions/Profiles";
import {GetAccountBalance} from "../actions/Accounts";

class ProfileContainer extends React.PureComponent {
  componentDidMount() {
    GetAccountBalance({context: this.props.context, address: this.props.context.currentAccount});
    UserMetadata({context: this.props.context});
    UserProfileImage({context: this.props.context});
  }

  render() {
    const currentAccount = this.props.context.accounts[this.props.context.currentAccount];

    return (
      <Profile
        account={currentAccount}
        UpdateUserProfileImage={(image) => UpdateUserProfileImage({context: this.props.context, image})}
        ReplaceUserMetadata={({metadataSubtree="/", metadata}) => ReplaceUserMetadata({context: this.props.context, metadataSubtree, metadata})}
        DeleteUserMetadata={({metadataSubtree="/"}) => DeleteUserMetadata({context: this.props.context, metadataSubtree})}
      />
    );
  }
}

export default ElvCoreConsumer(ProfileContainer);
