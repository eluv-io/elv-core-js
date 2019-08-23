export const UpdateProfiles = async ({context}) => {
  let updatedAccounts = context.accounts;

  await Promise.all(Object.keys(updatedAccounts).map(async address => {
    if(context.client.signer) {
      const name = await context.client.userProfileClient.PublicUserMetadata({address, metadataSubtree: "name"});

      // Name must not be an object because it is rendered directly
      updatedAccounts[address].name = typeof name === "string" ? name : "";
      updatedAccounts[address].profileImage = await context.client.userProfileClient.UserProfileImage({address});
    }
    updatedAccounts[address].balance = context.client.utils.ToBigNumber(
      await context.client.GetBalance({address})
    ).toFixed(3);
  }));

  await context.MergeContext("accounts", updatedAccounts);
};

export const UserProfileImage = async ({context, address}) => {
  const profileImage = await context.client.userProfileClient.UserProfileImage();
  return await context.MergeContext("accounts", address, {profileImage});
};

export const UpdateUserProfileImage = async ({context, image}) => {
  await context.client.userProfileClient.SetUserProfileImage(({image}));
  await UserMetadata({context});
  await UserProfileImage({context, address: context.currentAccount});
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

