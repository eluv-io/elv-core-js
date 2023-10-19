import {flow, makeAutoObservable} from "mobx";
import {ElvClient, Utils} from "@eluvio/elv-client-js";
import {v4 as UUID, parse as UUIDParse} from "uuid";

class TenantStore {
  tenantAdminGroupMembers = [];
  tenantMetadata = {};

  invites;

  INVITE_EVENTS = {
    SENT: "CORE_INVITE_SENT",
    ACCEPTED: "CORE_INVITE_ACCEPTED",
    MANAGED: "CORE_INVITE_MANAGED"
  };

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
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

  UpdateTenantInfo = flow(function * ({name, description, image}) {
    if(!this.tenantContractId) { return; }

    const libraryId = yield this.rootStore.client.ContentObjectLibraryId({objectId: this.tenantContractId});
    const objectId = Utils.AddressToObjectId(Utils.HashToAddress(this.tenantContractId));

    yield this.rootStore.client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      callback: async ({writeToken}) => {
        if(image) {
          const extension = image.name ? image.name.split(".").slice(-1)[0] : "";
          const filename = extension ? `tenant_image.${extension}` : "tenant_image";
          await this.rootStore.client.UploadFiles({
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

          await this.rootStore.client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadataSubtree: "public/image",
            metadata: {
              "/": "./files/" + filename
            }
          });
        }

        await this.rootStore.client.MergeMetadata({
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

    yield this.LoadPublicTenantMetadata();
  });

  LoadPublicTenantMetadata = flow(function * () {
    if(!this.tenantContractId) { return; }

    const libraryId = yield this.rootStore.client.ContentObjectLibraryId({objectId: this.tenantContractId});
    const objectId = Utils.AddressToObjectId(Utils.HashToAddress(this.tenantContractId));

    this.tenantMetadata[this.tenantContractId] = {
      public: yield this.rootStore.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "/public",
        produceLinkUrls: true
      })
    };
  });

  LoadGroupMembers = flow(function * () {
    const tenantContractId = yield this.rootStore.client.userProfileClient.TenantContractId();
    const tenantAdminGroupAddress = yield this.rootStore.client.CallContractMethod({
      contractAddress: this.rootStore.client.utils.HashToAddress(tenantContractId),
      methodName: "groupsMapping",
      methodArgs: ["tenant_admin", 0],
      formatArguments: true,
    });

    const [tenantOwner, tenantMembers, tenantManagers] = yield Promise.all([
      this.rootStore.client.AccessGroupOwner({contractAddress: tenantAdminGroupAddress}),
      this.rootStore.client.AccessGroupMembers({contractAddress: tenantAdminGroupAddress}),
      this.rootStore.client.AccessGroupManagers({contractAddress: tenantAdminGroupAddress})
    ]);

    this.tenantAdminGroupMembers = yield Promise.all(
      [...new Set([tenantOwner, ...tenantMembers, ...tenantManagers])].map(async address => {
        let name = "";
        try {
          name = await this.rootStore.client.userProfileClient.PublicUserMetadata({address, metadataSubtree: "name"});
        // eslint-disable-next-line no-empty
        } catch (error) {}

        return {
          address,
          isOwner: Utils.EqualAddress(tenantOwner, address),
          isManager: tenantManagers.includes(address),
          name
        };
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
    const wallet = this.rootStore.client.GenerateWallet();
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

  LoadInviteNotifications = flow(function * () {
    const inviteNotifications = yield this.rootStore.walletClient.Notifications({
      tenantId: this.tenantContractId,
      types: [Object.values(this.INVITE_EVENTS)],
      limit: 10000
    });

    // Combine invites by ID, from oldest to newest
    let invites = {};
    inviteNotifications
      .sort((a,b) => a.created < b.created ? -1 : 1)
      .forEach(invite =>
        invites[invite.data.id] = invite
      );

    let categorizedInvites = {
      sent: [],
      accepted: [],
      managed: []
    };

    // Sort into categories, from newest to oldest
    Object.values(invites)
      .sort((a, b) => a.created > b.created ? -1 : 1)
      .forEach(invite => {
        switch (invite.type) {
          case this.INVITE_EVENTS.SENT:
            categorizedInvites.sent.push(invite);
            break;
          case this.INVITE_EVENTS.ACCEPTED:
            categorizedInvites.accepted.push(invite);
            break;
          case this.INVITE_EVENTS.MANAGED:
            categorizedInvites.managed.push(invite);
            break;
        }
      });

    this.invites = categorizedInvites;
  });
}

export default TenantStore;
