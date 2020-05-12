import {action, computed, flow, observable} from "mobx";

class ProfilesStore {
  @observable profiles = {};

  @computed get currentProfile() {
    return this.rootStore.accountStore.currentAccountAddress ?
      this.profiles[this.rootStore.accountStore.currentAccountAddress] : { metadata: { public: {} } };
  }

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  ResizeImage(imageUrl, height) {
    return client.utils.ResizeImage({
      imageUrl,
      height
    });
  }

  @action.bound
  PublicMetadata = flow(function * (address) {
    if(!this.profiles[address]) {
      this.profiles[address] = {
        metadata: {
          public: {
            name: ""
          }
        }
      };
    }

    try {
      this.profiles[address].metadata.public =
        (yield this.rootStore.client.userProfileClient.PublicUserMetadata({address})) || {};

      if(!this.profiles[address].metadata.public.name) {
        this.profiles[address].metadata.public.name = "";
      }

      if(!this.profiles[address].imageUrl && this.profiles[address].metadata.public.profile_image) {
        this.profiles[address].imageUrl = yield this.rootStore.client.userProfileClient.UserProfileImage({address});
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to list public metadata for user ${address}: ${error.message}`);
    }

    yield this.rootStore.accountStore.AccountBalance(address);
  });

  @action.bound
  UserMetadata = flow(function * () {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    const address = this.rootStore.accountStore.currentAccountAddress;

    if(!this.profiles[address]) {
      this.profiles[address] = {
        metadata: {}
      };
    }

    this.profiles[address].metadata =
      (yield this.rootStore.client.userProfileClient.UserMetadata()) || {};

    if(!this.profiles[address].metadata.public) {
      this.profiles[address].metadata.public = {};
    }

    if(!this.profiles[address].imageUrl && this.profiles[address].metadata.public.profile_image) {
      this.profiles[address].imageUrl = (yield this.rootStore.client.userProfileClient.UserProfileImage({address}));
    }

    yield this.rootStore.accountStore.AccountBalance(address);
  });

  @action.bound
  ReplaceUserProfileImage = flow(function * (image) {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.SetUserProfileImage({image});

    yield this.UserMetadata();

    const address = this.rootStore.accountStore.currentAccountAddress;

    this.profiles[address].imageUrl =
      (yield this.rootStore.client.userProfileClient.UserProfileImage({address}))
      + `&cache=${Math.random()}` ;
  });

  @action.bound
  ReplaceUserMetadata = flow(function * ({metadataSubtree, metadata}) {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.ReplaceUserMetadata({metadataSubtree, metadata});

    yield this.UserMetadata();
  });

  @action.bound
  DeleteUserMetadata = flow(function * ({metadataSubtree}) {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.DeleteUserMetadata({metadataSubtree});

    yield this.UserMetadata();
  });
}

export default ProfilesStore;
