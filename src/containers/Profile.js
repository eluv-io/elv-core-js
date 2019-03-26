import React from "react";
import {ElvCoreConsumer} from "../ElvCoreContext";
import Profile from "../components/Profile";
import {
  DeletePrivateUserMetadata,
  PrivateProfileInfo,
  PublicProfileInfo, ReplacePrivateUserMetadata,
  ReplacePublicUserMetadata,
  UpdateUserProfileImage
} from "../actions/Profiles";

class ProfileContainer extends React.PureComponent {
  componentDidMount() {
    PublicProfileInfo({context: this.props.context, address: this.props.context.currentAccount});
    PrivateProfileInfo({context: this.props.context});
  }

  render() {
    const currentAccount = this.props.context.accounts[this.props.context.currentAccount];

    return (
      <Profile
        account={currentAccount}
        UpdateUserProfileImage={(image) => UpdateUserProfileImage({context: this.props.context, image})}
        ReplacePublicUserMetadata={({metadataSubtree="/", metadata}) => ReplacePublicUserMetadata({context: this.props.context, metadataSubtree, metadata})}
        ReplacePrivateUserMetadata={({metadataSubtree="/", metadata}) => ReplacePrivateUserMetadata({context: this.props.context, metadataSubtree, metadata})}
        DeletePrivateUserMetadata={({metadataSubtree="/"}) => DeletePrivateUserMetadata({context: this.props.context, metadataSubtree})}
      />
    );
  }
}

export default ElvCoreConsumer(ProfileContainer);
