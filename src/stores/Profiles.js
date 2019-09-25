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

  @action.bound
  UpdatePublicMetadata = flow(function * (address) {
    if(!this.profiles[address]) {
      this.profiles[address] = {
        metadata: {
          public: {}
        }
      };
    }

    this.profiles[address].metadata.public =
      (yield this.rootStore.client.userProfileClient.PublicUserMetadata({address})) || {};

    if(!this.profiles[address].imageUrl && this.profiles[address].metadata.public.image) {
      this.profiles[address].imageUrl = yield this.rootStore.client.userProfileClient.UserProfileImage({address});
    }
  });

  @action.bound
  UpdateUserMetadata = flow(function * () {
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

    if(!this.profiles[address].imageUrl && this.profiles[address].metadata.public.image) {
      this.profiles[address].imageUrl = yield this.rootStore.client.userProfileClient.UserProfileImage({address});
    }
  });

  @action.bound
  ReplaceUserProfileImage = flow(function * (image) {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.SetUserProfileImage({image});

    yield this.UpdateUserMetadata();

    const address = this.rootStore.accountStore.currentAccountAddress;

    this.profiles[address].imageUrl =
      yield this.rootStore.client.userProfileClient.UserProfileImage({address});
  });

  @action.bound
  ReplaceUserMetadata = flow(function * ({metadataSubtree, metadata}) {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.ReplaceUserMetadata({metadataSubtree, metadata});

    yield this.UpdateUserMetadata();
  });

  @action.bound
  DeleteUserMetadata = flow(function * ({metadataSubtree}) {
    if(!this.rootStore.accountStore.currentAccountAddress) { return; }

    yield this.rootStore.client.userProfileClient.DeleteUserMetadata({metadataSubtree});

    yield this.UpdateUserMetadata();
  });
}

export default ProfilesStore;
