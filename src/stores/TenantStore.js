import {flow, makeAutoObservable, runInAction} from "mobx";
import {ElvClient, Utils} from "@eluvio/elv-client-js";
import {v4 as UUID, parse as UUIDParse} from "uuid";

class TenantStore {
  tenantMetadata = {};

  managedGroups;
  specialGroups = {
    tenantAdmins: undefined,
    tenantUsers: undefined,
    contentAdmins: undefined
  };

  invites;
  inviteListener;

  tenantUsers;
  tenantAdmins;

  users = {};

  INVITE_EVENTS = {
    SENT: "CORE_INVITE_SENT",
    ACCEPTED: "CORE_INVITE_ACCEPTED",
    MANAGED: "CORE_INVITE_MANAGED"
  };

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

    this.Log = rootStore.Log;
  }

  get client() {
    return this.rootStore.client;
  }

  get isTenantAdmin() {
    return this.rootStore.accountsStore.isTenantAdmin;
  }

  get tenantContractId() {
    return this.rootStore.accountsStore.currentAccount?.tenantContractId;
  }

  get publicTenantMetadata() {
    return this.tenantMetadata[this.tenantContractId]?.public;
  }

  Reset() {
    this.specialGroups = { tenantAdmins: undefined, tenantUsers: undefined, contentAdmins: undefined };
    this.managedGroups = undefined;
    this.invites = undefined;
    this.tenantUsers = undefined;
    this.tenantAdmins = undefined;
    this.users = {};
    this.tenantMetadata = {};

    if(this.inviteListener) {
      try {
        this.inviteListener.close();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error closing notification listener:");
        // eslint-disable-next-line no-console
        console.error(error);
      }

      this.inviteListener = undefined;
    }
  }

  UpdateTenantInfo = flow(function * ({name, description, image}) {
    if(!this.tenantContractId) { return; }

    const libraryId = yield this.client.ContentObjectLibraryId({objectId: this.tenantContractId});
    const objectId = Utils.AddressToObjectId(Utils.HashToAddress(this.tenantContractId));

    yield this.client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      callback: async ({writeToken}) => {
        if(image) {
          const extension = image.name ? image.name.split(".").slice(-1)[0] : "";
          const filename = extension ? `tenant_image.${extension}` : "tenant_image";
          await this.client.UploadFiles({
            libraryId,
            objectId,
            writeToken,
            fileInfo: [{
              path: filename,
              mime_type: image.type,
              size: image.size,
              data: image
            }]
          });

          await this.client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadataSubtree: "public/image",
            metadata: {
              "/": "./files/" + filename
            }
          });
        }

        await this.client.MergeMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: "public",
          metadata: {
            name,
            description
          }
        });
      }
    });

    yield this.LoadPublicTenantMetadata({force: true});
  });

  LoadPublicTenantMetadata = flow(function * ({tenantContractId, force}={}) {
    try {
      tenantContractId = tenantContractId || this.tenantContractId;
      if(!tenantContractId || (this.tenantMetadata[tenantContractId] && !force)) {
        return;
      }

      const libraryId = yield this.client.ContentObjectLibraryId({objectId: tenantContractId});
      const objectId = Utils.AddressToObjectId(Utils.HashToAddress(tenantContractId));

      this.tenantMetadata[tenantContractId] = {
        public: yield this.client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "/public",
          produceLinkUrls: true
        })
      };
    } catch (error) {
      this.Log("Failed to load tenant contract metadata for " + tenantContractId, true);
      this.Log(error, true);
    }
  });

  // Groups

  LoadManagedGroups = flow(function * () {
    if(!this.managedGroups) {
      const allGroups = yield this.client.ListAccessGroups();
      let managedGroups = yield Promise.all(
        allGroups.map(async group => {
          try {
            // Owner
            const owner = await this.client.AccessGroupOwner({contractAddress: group.address});
            if(Utils.EqualAddress(owner, this.rootStore.accountsStore.currentAccountAddress)) {
              return group;
            }

            // Manager
            const managers = await this.client.AccessGroupManagers({contractAddress: group.address});
            if(managers.find(userAddress => Utils.EqualAddress(userAddress, this.rootStore.accountsStore.currentAccountAddress))) {
              return group;
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log("Error retrieving manager info for group", group.address, group, error);
          }
        })
      );

      const tenantContractId = yield this.client.userProfileClient.TenantContractId();
      const tenantAdminGroupAddress = yield this.client.CallContractMethod({
        contractAddress: this.client.utils.HashToAddress(tenantContractId),
        methodName: "groupsMapping",
        methodArgs: ["tenant_admin", 0],
        formatArguments: true,
      });
      const tenantUsersGroupAddress = yield this.client.CallContractMethod({
        contractAddress: this.client.utils.HashToAddress(tenantContractId),
        methodName: "groupsMapping",
        methodArgs: ["tenant_users", 0],
        formatArguments: true,
      });
      const contentAdminGroupAddress = yield this.client.CallContractMethod({
        contractAddress: this.client.utils.HashToAddress(tenantContractId),
        methodName: "groupsMapping",
        methodArgs: ["content_admin", 0],
        formatArguments: true,
      });

      // Sort special groups to the top of the list, if present
      const contentAdminGroupIndex = managedGroups.findIndex(group => Utils.EqualAddress(group?.address, contentAdminGroupAddress));
      if(contentAdminGroupAddress >= 0) {
        const contentAdminGroup = managedGroups[contentAdminGroupIndex];
        delete managedGroups[contentAdminGroupIndex];
        managedGroups.unshift(contentAdminGroup);

        this.specialGroups.contentAdmins = contentAdminGroup;
      }

      const tenantAdminGroupIndex = managedGroups.findIndex(group => Utils.EqualAddress(group?.address, tenantAdminGroupAddress));
      if(tenantAdminGroupAddress >= 0) {
        const tenantAdminGroup = managedGroups[tenantAdminGroupIndex];
        delete managedGroups[tenantAdminGroupIndex];
        managedGroups.unshift(tenantAdminGroup);

        this.specialGroups.tenantAdmins = tenantAdminGroup;
      }

      const tenantUsersGroupIndex = managedGroups.findIndex(group => Utils.EqualAddress(group?.address, tenantUsersGroupAddress));
      if(tenantUsersGroupIndex >= 0) {
        const tenantUsersGroup = managedGroups[tenantUsersGroupIndex];
        delete managedGroups[tenantUsersGroupIndex];
        managedGroups.unshift(tenantUsersGroup);

        this.specialGroups.tenantUsers = tenantUsersGroup;
      }

      this.managedGroups = managedGroups.filter(group => group);
    }

    return this.managedGroups;
  });

  LoadUser = flow(function * ({address}) {
    if(this.users[address]) { return; }

    const [name, profileImage, balance] = yield Promise.allSettled([
      this.client.userProfileClient.PublicUserMetadata({address, metadataSubtree: "name"}),
      this.client.userProfileClient.UserProfileImage({address}),
      this.rootStore.accountsStore.AccountBalance(address)
    ]);

    this.users[address] = {
      name: name.status === "fulfilled" && name.value || undefined,
      profileImage: profileImage.status === "fulfilled" && profileImage.value || undefined,
      balance: balance.status === "fulfilled" && balance.value || undefined
    };
  });

  LoadTenantUsers = flow(function * () {
    if(!this.tenantContractId) { return; }

    if(!this.specialGroups.tenantUsers || !this.specialGroups.tenantAdmins) {
      yield this.LoadManagedGroups();
    }

    const tenantUsersGroupAddress = this.specialGroups.tenantUsers.address;
    const [tenantUsersOwner, tenantUsersManagers, tenantUsersMembers] = yield Promise.allSettled([
      this.client.AccessGroupOwner({contractAddress: tenantUsersGroupAddress}),
      this.client.AccessGroupManagers({contractAddress: tenantUsersGroupAddress}),
      this.client.AccessGroupMembers({contractAddress: tenantUsersGroupAddress})
    ]);

    const tenantUsers = [
      tenantUsersOwner.status === "fulfilled" && tenantUsersOwner.value,
      ...(tenantUsersManagers.status === "fulfilled" && tenantUsersManagers.value || []),
      ...(tenantUsersMembers.status === "fulfilled" && tenantUsersMembers.value || [])
    ]
      .filter(user => user)
      .filter((value, index, array) => array.indexOf(value) === index);

    const tenantAdminsGroupAddress = this.specialGroups.tenantAdmins.address;
    const [tenantAdminsOwner, tenantAdminsManagers, tenantAdminsMembers] = yield Promise.allSettled([
      this.client.AccessGroupOwner({contractAddress: tenantAdminsGroupAddress}),
      this.client.AccessGroupManagers({contractAddress: tenantAdminsGroupAddress}),
      this.client.AccessGroupMembers({contractAddress: tenantAdminsGroupAddress})
    ]);

    const tenantAdmins = [
      tenantAdminsOwner.status === "fulfilled" && tenantAdminsOwner.value,
      ...(tenantAdminsManagers.status === "fulfilled" && tenantAdminsManagers.value || []),
      ...(tenantAdminsMembers.status === "fulfilled" && tenantAdminsMembers.value || [])
    ]
      .filter(user => user)
      .filter((value, index, array) => array.indexOf(value) === index);

    // Load info on users
    yield this.client.utils.LimitedMap(
      10,
      [...tenantUsers, ...tenantAdmins]
        .filter((value, index, array) => array.indexOf(value) === index),
      async address => await this.LoadUser({address})
    );

    this.tenantUsers = tenantUsers;
    this.tenantAdmins = tenantAdmins;
  });

  UserManagedGroupMembership = flow(function * ({userAddress}) {
    let status = {};
    yield Promise.all(
      (this.managedGroups || []).map(async ({address}) => {
        const [owner, managers, members] = await Promise.allSettled([
          this.client.AccessGroupOwner({contractAddress: address}),
          this.client.AccessGroupManagers({contractAddress: address}),
          this.client.AccessGroupMembers({contractAddress: address})
        ]);

        status[address] = {
          owner: owner.status === "fulfilled" && Utils.EqualAddress(owner.value, userAddress),
          manager: managers.status === "fulfilled" && !!managers.value.find(manager => Utils.EqualAddress(manager, userAddress)),
          member: members.status === "fulfilled" && !!members.value.find(member => Utils.EqualAddress(member, userAddress)),
        };
      })
    );

    return status;
  });

  SetUserGroupPermissions = flow(function * ({userAddress, originalPermissions, permissions}) {
    yield Promise.all(
      Object.keys(permissions).map(async groupAddress => {
        if(permissions[groupAddress].manager && !originalPermissions[groupAddress]?.manager) {
          // Set manager
          await this.client.AddAccessGroupManager({contractAddress: groupAddress, memberAddress: userAddress});
        } else if(!permissions[groupAddress].manager && originalPermissions[groupAddress]?.manager) {
          // Remove manager
          await this.client.RemoveAccessGroupManager({contractAddress: groupAddress, memberAddress: userAddress});
        }

        if(permissions[groupAddress].member && !originalPermissions[groupAddress]?.member) {
          // Set member
          await this.client.AddAccessGroupMember({contractAddress: groupAddress, memberAddress: userAddress});
        } else if(!permissions[groupAddress].member && originalPermissions[groupAddress]?.member) {
          // Remove member
          await this.client.RemoveAccessGroupMember({contractAddress: groupAddress, memberAddress: userAddress});
        }
      })
    );
  });

  // Invites

  GenerateInvite = flow(function * ({name, funds}) {
    yield new Promise(resolve => setTimeout(resolve, 2000));

    const id = Utils.B58(UUIDParse(UUID()));

    const params = Utils.B58(
      JSON.stringify({
        id,
        name,
        adminAddress: this.rootStore.accountsStore.currentAccountAddress,
        tenantContractId: this.tenantContractId,
        faucetToken: "asd"
      })
    );

    let url = new URL(window.location.origin);
    url.pathname = "/onboard";
    url.searchParams.set("obp", params);

    yield this.rootStore.walletClient.PushNotification({
      tenantId: this.tenantContractId,
      eventType: this.INVITE_EVENTS.SENT,
      data: {
        id,
        name,
        url: url.toString()
      }
    });

    return url.toString();
  });

  ConsumeInvite = flow(function * ({tenantContractId, name, address, inviteId, adminAddress, faucetToken}) {
    // TODO: Implement faucet
    const wallet = this.client.GenerateWallet();
    const fundedClient = yield ElvClient.FromConfigurationUrl({configUrl: EluvioConfiguration["config-url"]});
    const fundedSigner = wallet.AddAccount({privateKey: "0x89eb99fe9ce236af2b6e1db964320534ef6634127ecdeb816f6e4c72bc72bcec"});

    fundedClient.SetSigner({signer: fundedSigner});
    yield fundedClient.SendFunds({
      recipient: address,
      ether: 1
    });

    yield this.rootStore.walletClient.PushNotification({
      tenantId: tenantContractId,
      eventType: this.INVITE_EVENTS.ACCEPTED,
      userAddress: adminAddress,
      data: {
        id: inviteId,
        address,
        name
      }
    });
  })

  CompleteInvite = flow(function * ({inviteId}) {
    const notifications = yield this.rootStore.walletClient.Notifications({
      tenantId: this.tenantContractId,
      types: [this.INVITE_EVENTS.ACCEPTED, this.INVITE_EVENTS.MANAGED],
      limit: 10000
    });

    if(notifications.find(invite => invite.type === this.INVITE_EVENTS.MANAGED && invite.data.id === inviteId)) {
      // Already completed
      return;
    }

    const acceptedInvite = notifications.find(invite => invite.type === this.INVITE_EVENTS.ACCEPTED && invite.data.id === inviteId);

    if(!acceptedInvite) {
      throw Error("Unable to find corresponding invite for " + inviteId);
    }

    yield this.rootStore.walletClient.PushNotification({
      tenantId: this.tenantContractId,
      eventType: this.INVITE_EVENTS.MANAGED,
      userAddress: this.rootStore.accountsStore.currentAccountAddress,
      data: {
        ...acceptedInvite.data
      }
    });
  });

  LoadInviteNotifications = flow(function * () {
    if(this.invites) { return; }

    const inviteNotifications = yield this.rootStore.walletClient.Notifications({
      tenantId: this.tenantContractId,
      types: [Object.values(this.INVITE_EVENTS)],
      limit: 10000
    });

    let invites = {};
    // Collapse invites by ID by iterating from oldest to newest
    inviteNotifications
      .sort((a, b) => a.created < b.created ? -1 : 1)
      .forEach(invite => {
        if(!invite.data?.id) { return; }

        invites[invite.data.id] = invite;
      });

    this.invites = invites;

    if(!this.inviteListener) {
      this.inviteListener = this.rootStore.walletClient.AddNotificationListener({
        onMessage: invite => {
          if(!Object.values(this.INVITE_EVENTS).includes(invite.type) || !invite.data?.id) {
            return;
          }

          runInAction(() => {
            this.invites[invite.data.id] = {
              ...invite,
              new: true
            };
          });
        }
      });
    }
  });

  // Retrieve list of invites, filtered by type, from newest to oldest
  Invites(type) {
    return Object.values(this.invites || [])
      .filter(invite => invite.type === type)
      .sort((a, b) => a.created > b.created ? -1 : 1);
  }
}

export default TenantStore;
