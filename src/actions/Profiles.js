export const UserProfileImage = async ({context, address}) => {
  const profileImage = await context.client.userProfile.UserProfileImage({accountAddress: address});

  await context.MergeContext("accounts", address, {profileImage});
};

export const PublicProfileInfo = async ({context, address}) => {
  if(!address) { return; }

  const profileInfo = await context.client.userProfile.PublicUserMetadata({accountAddress: address}) || {};
  await context.MergeContext("accounts", address, "profile", profileInfo);

  await UserProfileImage({context, address});
};

export const PrivateProfileInfo = async ({context}) => {
  if(!context.currentAccount) { return; }

  const profileInfo = await context.client.userProfile.PrivateUserMetadata() || {};
  await context.MergeContext("accounts", context.currentAccount, "privateProfile", profileInfo);
};

export const UpdateUserProfileImage = async ({context, image}) => {
  await context.client.userProfile.SetUserProfileImage(({image}));
  await PublicProfileInfo({context, address: context.currentAccount});
};

export const ReplacePublicUserMetadata = async ({context, metadataSubtree="/", metadata}) => {
  await context.client.userProfile.ReplacePublicUserMetadata(({metadataSubtree, metadata}));
  await PublicProfileInfo({context, address: context.currentAccount});
};

export const DeletePublicUserMetadata = async ({context, metadataSubtree="/", metadata}) => {
  await context.client.userProfile.DeletePublicUserMetadata(({metadataSubtree, metadata}));
  await PublicProfileInfo({context, address: context.currentAccount});
};

export const ReplacePrivateUserMetadata = async ({context, metadataSubtree="/", metadata}) => {
  await context.client.userProfile.ReplacePrivateUserMetadata(({metadataSubtree, metadata}));
  await PrivateProfileInfo({context});
};

export const DeletePrivateUserMetadata = async ({context, metadataSubtree="/", metadata}) => {
  await context.client.userProfile.DeletePrivateUserMetadata(({metadataSubtree, metadata}));
  await PrivateProfileInfo({context});
};

