import {flow, makeAutoObservable} from "mobx";
import {Utils} from "@eluvio/elv-client-js";

class TenantStore {
  tenantAdminGroupMembers = [];
  tenantMetadata = {};

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

  GenerateInviteUrl = flow(function * ({name, funds}) {
    yield new Promise(resolve => setTimeout(resolve, 2000));

    const params = Utils.B58(
      JSON.stringify({
        name,
        adminAddress: this.rootStore.accountsStore.currentAccountAddress,
        tenantContractId: this.tenantContractId,
        faucetToken: "asd"
      })
    );

    let url = new URL(window.location.origin);
    url.pathname = "/onboard";
    url.searchParams.set("obp", params);

    return url.toString();
  })

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
}

export default TenantStore;
