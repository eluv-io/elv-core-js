export const UpdateProfiles = async ({context}) => {
  let updatedAccounts = context.accounts;

  await Promise.all(Object.keys(updatedAccounts).map(async address => {
    updatedAccounts[address].balance = context.client.utils.ToBigNumber(
      await context.client.GetBalance({address})
    ).toFixed(3);
  }));

  await context.MergeContext("accounts", updatedAccounts);
};

export const UserProfileImage = async ({context}) => {
  const profileImage = await context.client.userProfileClient.UserProfileImage();
  await context.MergeContext("accounts", context.currentAccount, {profileImage});
};

export const UpdateUserProfileImage = async ({context, image}) => {
  await context.client.userProfileClient.SetUserProfileImage(({image}));
  await UserMetadata({context});
  await UserProfileImage({context});
};

export const UserMetadata = async ({context}) => {
  if(!context.currentAccount) { return; }

  const profileInfo = await context.client.userProfileClient.UserMetadata() || {};

  await context.MergeContext("accounts", context.currentAccount, "profile", profileInfo);
};

export const ReplaceUserMetadata = async ({context, metadataSubtree="/", metadata}) => {
  await context.client.userProfileClient.ReplaceUserMetadata(({metadataSubtree, metadata}));
  await UserMetadata({context});
};

export const DeleteUserMetadata = async ({context, metadataSubtree="/", metadata}) => {
  await context.client.userProfileClient.DeleteUserMetadata(({metadataSubtree, metadata}));
  await UserMetadata({context});
};

