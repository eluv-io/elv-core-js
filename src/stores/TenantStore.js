import {flow, makeAutoObservable, runInAction} from "mobx";
import {Utils} from "@eluvio/elv-client-js";
import {v4 as UUID, parse as UUIDParse} from "uuid";
import UrlJoin from "url-join";
import {accountsStore} from "./index";

class TenantStore {
  onboardParams;

  isTenantOwner = false;
  tenantMetadata = {};
  tenantFundingAccount;

  groups;
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
    MANAGED: "CORE_INVITE_MANAGED",
    DELETED: "CORE_INVITE_DELETED"
  };

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

    this.Log = rootStore.Log;

    const obp = new URLSearchParams(window.location.search).get("obp");
    if(obp) {
      try {
        this.onboardParams = JSON.parse(Utils.FromB58ToStr(obp));
      } catch (error) {
        this.Log("Failed to parse onboarding params", true);
        this.Log(error, true);
      }
    }
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

  get tenantFunds() {
    return parseFloat(this.tenantFundingAccount?.funding_address_balance) || 0;
  }

  Reset() {
    this.specialGroups = { tenantAdmins: undefined, tenantUsers: undefined, contentAdmins: undefined };
    this.groups = undefined;
    this.managedGroups = undefined;
    this.invites = undefined;
    this.tenantUsers = undefined;
    this.tenantAdmins = undefined;
    this.users = {};
    this.tenantMetadata = {};
    this.isTenantOwner = false;

    if(this.inviteListener) {
      try {
        this.inviteListener.close();
      } catch (error) {
        this.Log("Error closing notification listener:", "warn");
        this.Log(error, "warn");
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

    this.rootStore.accountsStore.UpdateTenantName({
      tenantContractId: this.tenantContractId,
      name
    });
  });

  LoadPublicTenantMetadata = flow(function * ({tenantContractId, force}={}) {
    try {
      tenantContractId = tenantContractId || this.tenantContractId;
      if(!tenantContractId || (this.tenantMetadata[tenantContractId] && !force)) {
        return;
      }

      const tenantOwner = yield this.rootStore.client.CallContractMethod({
        contractAddress: Utils.HashToAddress(tenantContractId),
        methodName: "owner"
      });

      this.isTenantOwner = Utils.EqualAddress(tenantOwner, this.rootStore.accountsStore.currentAccountAddress);

      const libraryId = yield this.client.ContentObjectLibraryId({objectId: tenantContractId});
      const objectId = Utils.AddressToObjectId(Utils.HashToAddress(tenantContractId));

      this.tenantMetadata[tenantContractId] = {
        public: (yield this.client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "/public",
          produceLinkUrls: true
        })) || {}
      };

      if(this.tenantMetadata[tenantContractId]?.public?.name?.startsWith("iq__")) {
        this.tenantMetadata[tenantContractId].public.name = "";
      }
    } catch (error) {
      this.Log("Failed to load tenant contract metadata for " + tenantContractId, true);
      this.Log(error, true);
    }
  });

  LoadTenantFundingAccount = flow(function * () {
    const tenantContractId = this.rootStore.accountsStore.currentAccount.tenantContractId;
    if(!this.tenantFundingAccount) {
      this.tenantFundingAccount = (yield this.rootStore.client.utils.ResponseToJson(
        this.rootStore.client.MakeAuthServiceRequest({
          path: UrlJoin("as", "faucet", "get_tenant", tenantContractId),
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.rootStore.walletClient.AuthToken()}`
          }
        })
      ))?.tenant_record;
    } else {
      this.tenantFundingAccount.funding_address_balance = parseFloat(
        yield this.rootStore.client.GetBalance({
          address: this.tenantFundingAccount.tenant_funding_address
        })
      );
    }

    return this.tenantFundingAccount;
  });

  // Groups

  LoadManagedGroups = flow(function * () {
    if(!this.managedGroups) {
      const allGroups = (yield Promise.all(
        (yield this.client.ListAccessGroups()).map(async group => {
          try {
            group.isMember = true;

            // Owner
            const owner = await this.client.AccessGroupOwner({contractAddress: group.address});
            group.isOwner = Utils.EqualAddress(owner, this.rootStore.accountsStore.currentAccountAddress);

            // Manager
            const managers = await this.client.AccessGroupManagers({contractAddress: group.address});
            group.isManager = !!managers.find(userAddress => Utils.EqualAddress(userAddress, this.rootStore.accountsStore.currentAccountAddress));

            return group;
          } catch (error) {
            this.Log(`Error retrieving manager info for group ${group.address}`, true);
            this.Log(group, true);
            this.Log(error, true);
          }
        }))
      ).filter(g => g);

      const tenantContractId = yield this.client.userProfileClient.TenantContractId();

      let tenantAdminGroupAddress, tenantUsersGroupAddress, contentAdminGroupAddress;
      try {
        tenantAdminGroupAddress = yield this.client.CallContractMethod({
          contractAddress: this.client.utils.HashToAddress(tenantContractId),
          methodName: "groupsMapping",
          methodArgs: ["tenant_admin", 0],
          formatArguments: true,
        });
      } catch (error) {
        this.Log("Failed to load tenant admin group", true);
        this.Log(error, true);
      }

      try {
        tenantUsersGroupAddress = yield this.client.CallContractMethod({
          contractAddress: this.client.utils.HashToAddress(tenantContractId),
          methodName: "groupsMapping",
          methodArgs: ["tenant_users", 0],
          formatArguments: true,
        });
      } catch (error) {
        this.Log("Failed to load tenant admin group", true);
        this.Log(error, true);
      }

      try {
        contentAdminGroupAddress = yield this.client.CallContractMethod({
          contractAddress: this.client.utils.HashToAddress(tenantContractId),
          methodName: "groupsMapping",
          methodArgs: ["content_admin", 0],
          formatArguments: true,
        });
      } catch (error) {
        this.Log("Failed to load tenant admin group", true);
        this.Log(error, true);
      }

      // Sort special groups to the top of the list, if present
      const contentAdminGroupIndex = allGroups.findIndex(group => Utils.EqualAddress(group?.address, contentAdminGroupAddress));
      if(contentAdminGroupAddress >= 0) {
        const contentAdminGroup = allGroups[contentAdminGroupIndex];
        delete allGroups[contentAdminGroupIndex];
        allGroups.unshift(contentAdminGroup);

        this.specialGroups.contentAdmins = contentAdminGroup;
      } else {
        this.specialGroups.contentAdmins = {
          address: contentAdminGroupAddress,
          meta: { public: { name: "Content Admins" } }
        };
      }

      const tenantAdminGroupIndex = allGroups.findIndex(group => Utils.EqualAddress(group?.address, tenantAdminGroupAddress));
      if(tenantAdminGroupAddress >= 0) {
        const tenantAdminGroup = allGroups[tenantAdminGroupIndex];
        delete allGroups[tenantAdminGroupIndex];
        allGroups.unshift(tenantAdminGroup);

        this.specialGroups.tenantAdmins = tenantAdminGroup;
      } else {
        this.specialGroups.tenantAdmins = {
          address: tenantAdminGroupAddress,
          meta: { public: { name: "Tenant Admins" } }
        };
      }

      const tenantUsersGroupIndex = allGroups.findIndex(group => Utils.EqualAddress(group?.address, tenantUsersGroupAddress));
      if(tenantUsersGroupIndex >= 0) {
        const tenantUsersGroup = allGroups[tenantUsersGroupIndex];
        delete allGroups[tenantUsersGroupIndex];
        allGroups.unshift(tenantUsersGroup);

        this.specialGroups.tenantUsers = tenantUsersGroup;
      } else {
        this.specialGroups.tenantUsers = {
          address: tenantUsersGroupAddress,
          meta: { public: { name: "Tenant Users" } }
        };
      }

      this.groups = allGroups;
      this.managedGroups = allGroups.filter(group => group?.isOwner || group?.isManager);
    }

    return this.managedGroups;
  });

  LoadUser = flow(function * ({address}) {
    if(!this.users[address]) {
      const [name, profileImage, balance] = yield Promise.allSettled([
        this.client.userProfileClient.PublicUserMetadata({address, metadataSubtree: "name"}),
        this.client.userProfileClient.UserProfileImage({address}),
        this.rootStore.accountsStore.AccountBalance(address)
      ]);

      this.users[address] = {
        name: name.status === "fulfilled" && name.value || undefined,
        profileImage: profileImage.status === "fulfilled" && profileImage.value || undefined,
        balance: balance.status === "fulfilled" && balance.value || undefined,
        address
      };
    } else {
      this.users[address].balance = yield this.rootStore.accountsStore.AccountBalance(address);
    }
  });

  LoadTenantUsers = flow(function * () {
    if(!this.tenantContractId) { return; }

    if(!this.specialGroups.tenantUsers || !this.specialGroups.tenantAdmins) {
      yield this.LoadManagedGroups();
    }

    const tenantUsersGroupAddress = this.specialGroups.tenantUsers?.address;
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
        const group = this.managedGroups.find(group => Utils.EqualAddress(group.address, groupAddress));

        if(!(group?.isOwner || group?.isManager)) {
          // Skip groups that the current user doesn't manage
          return;
        }

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

  TopUpFunds = flow(function * (address) {
    yield this.LoadTenantFundingAccount();
    const balance = parseFloat(yield this.rootStore.client.GetBalance({address}));

    const funds = parseFloat(this.tenantFundingAccount.per_top_up_limit) - balance;

    if(funds < 0.01) {
      return;
    }

    const body = { eth_amount: funds, ts: Date.now() };
    const token = yield this.rootStore.client.Sign(JSON.stringify(body));
    const { otp_id } = yield this.rootStore.client.utils.ResponseToJson(
      this.rootStore.client.MakeAuthServiceRequest({
        path: UrlJoin("as", "faucet", "add_otp", this.tenantContractId),
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );

    yield this.rootStore.client.MakeAuthServiceRequest({
      path: UrlJoin("as", "faucet", "claim_otp", otp_id),
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.rootStore.walletClient.AuthToken()}`
      }
    });

    yield accountsStore.SendFunds({
      recipient: address,
      ether: funds
    });

    yield this.LoadUser({address});
  });

  // Invites

  CreateShortURL = flow(function * (url) {
    try {
      // Normalize URL
      url = new URL(url).toString();
      const {url_mapping} = yield (yield fetch("https://elv.lv/tiny/create", {method: "POST", body: url})).json();
      return url_mapping.shortened_url;
    } catch (error) {
      this.Log(error, true);
    }
  });

  GenerateInvite = flow(function * ({name, email, funds=0.2}) {
    const body = { eth_amount: funds, ts: Date.now() };
    const token = yield this.rootStore.client.Sign(JSON.stringify(body));
    const { otp_id } = yield this.rootStore.client.utils.ResponseToJson(
      this.rootStore.client.MakeAuthServiceRequest({
        path: UrlJoin("as", "faucet", "add_otp", this.tenantContractId),
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );

    const id = Utils.B58(UUIDParse(UUID()));

    const params = Utils.B58(
      JSON.stringify({
        id,
        name,
        email,
        adminAddress: this.rootStore.accountsStore.currentAccountAddress,
        tenantContractId: this.tenantContractId,
        faucetToken: otp_id
      })
    );

    let url = new URL(window.location.origin);
    url.pathname = "/onboard";
    url.searchParams.set("obp", params);

    url = yield this.CreateShortURL(url.toString());

    yield this.rootStore.walletClient.PushNotification({
      tenantId: this.tenantContractId,
      eventType: this.INVITE_EVENTS.SENT,
      data: {
        id,
        name,
        email,
        tenantContractId: this.tenantContractId,
        adminAddress: this.rootStore.accountsStore.currentAccountAddress,
        url: url.toString()
      }
    });

    this.rootStore.accountsStore.SendLoginEmail({
      type: "send_invite_email",
      email,
      callbackUrl: url.toString()
    });

    return id;
  });

  ConsumeInvite = flow(function * ({
    id,
    tenantContractId,
    name,
    email,
    adminAddress,
    profileImageFile,
    faucetToken
  }) {
    const address = this.rootStore.accountsStore.currentAccountAddress;

    yield this.rootStore.client.MakeAuthServiceRequest({
      path: UrlJoin("as", "faucet", "claim_otp", faucetToken),
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.rootStore.walletClient.AuthToken()}`
      }
    });

    // Ensure user wallet contract is created
    yield this.rootStore.client.userProfileClient.CreateWallet();
    yield new Promise(resolve => setTimeout(resolve, 1000));
    yield this.rootStore.client.userProfileClient.WalletAddress(true);

    yield this.rootStore.accountsStore.AccountBalance(address);
    yield this.rootStore.accountsStore.SetTenantContractId({id: tenantContractId});
    yield this.rootStore.accountsStore.UserMetadata();

    try {
      yield this.rootStore.accountsStore.ReplaceUserMetadata({
        metadataSubtree: UrlJoin("public", "name"),
        metadata: name || email
      });

      if(profileImageFile) {
        yield this.rootStore.accountsStore.ReplaceUserProfileImage(profileImageFile);
      }
    } catch (error) {
      this.Log(error, true);
    }

    yield this.rootStore.walletClient.PushNotification({
      tenantId: tenantContractId,
      eventType: this.INVITE_EVENTS.ACCEPTED,
      userAddress: adminAddress,
      data: {
        id,
        address,
        name,
        email: this.rootStore.accountsStore.currentAccount?.email || email
      }
    });
  });

  CompleteInvite = flow(function * ({id}) {
    const notifications = yield this.rootStore.walletClient.Notifications({
      tenantId: this.tenantContractId,
      types: [this.INVITE_EVENTS.ACCEPTED, this.INVITE_EVENTS.MANAGED],
      limit: 10000
    });

    if(notifications.find(invite => invite.type === this.INVITE_EVENTS.MANAGED && invite.data.id === id)) {
      // Already completed
      return;
    }

    const acceptedInvite = notifications.find(invite => invite.type === this.INVITE_EVENTS.ACCEPTED && invite.data.id === id);

    if(!acceptedInvite) {
      throw Error("Unable to find corresponding invite for " + id);
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

  DeleteInvite = flow(function * ({id}) {
    yield this.rootStore.walletClient.PushNotification({
      tenantId: this.tenantContractId,
      eventType: this.INVITE_EVENTS.DELETED,
      userAddress: this.rootStore.accountsStore.currentAccountAddress,
      data: {
        id,
      }
    });

    delete this.invites[id];
  });

  LoadInviteNotifications = flow(function * () {
    if(this.invites) { return; }

    const inviteNotifications = yield this.rootStore.walletClient.Notifications({
      tenantId: this.tenantContractId,
      types: [Object.values(this.INVITE_EVENTS)],
      limit: 10000
    });

    let invites = {};
    let deletedInvites = {};
    // Collapse invites by ID by iterating from oldest to newest
    inviteNotifications
      .sort((a, b) => a.created < b.created ? -1 : 1)
      .forEach(invite => {
        if(!invite.data?.id) {
          return;
        } if(invite.type === this.INVITE_EVENTS.DELETED) {
          deletedInvites[invite.data.id] = true;
          delete invites[invite.data.id];
        } else if(!deletedInvites[invite.id]) {
          invites[invite.data.id] = invite;
        }
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
