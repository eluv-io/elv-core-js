import {SwitchAccount} from "../actions/Accounts";

export const SeedAccounts = async (store, client, accountManager) => {
  const seedAccounts = [
    {
      accountName: "Alice",
      accountAddress: "0x71b011b67dc8f5c323a34cd14b952721d5750c93",
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      encryptedPrivateKey: {"address":"71b011b67dc8f5c323a34cd14b952721d5750c93","crypto":{"cipher":"aes-128-ctr","ciphertext":"768c0b26476793e52c7e292b6b221fa4d7f82a7d20a7ccc042ce43c072f97f38","cipherparams":{"iv":"049e2bed69573f62da6576c21769b520"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"332b0f7730c580aa86b3ec8e79d228e9f76426bb328c468cb57e99e39132c29f"},"mac":"36079b7f32edf1c3d8d1697313f8088c78be07627ffb6421f655409373fded79"},"id":"8181d812-ab5e-4e5b-b023-e9049c2aec48","version":3}
    },
    {
      accountName: "Bob",
      accountAddress: "0x1cb99a5e4ccead43e98f61d25932bca5bf572484",
      privateKey: "0x2d953561666c11a5bec2b9d5fd1203f21eb0aff02b074daa4897fee6b4726a98",
      encryptedPrivateKey: {"address":"1cb99a5e4ccead43e98f61d25932bca5bf572484","crypto":{"cipher":"aes-128-ctr","ciphertext":"7bbd900da44ddc7c7d4210235cdfaa7e6eb32d4a0575c224497be7215fe0fec9","cipherparams":{"iv":"af0aba2f91b9bf892d85caba88dd667f"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"64d3b423f547c7f7b635300f767836d7ddd3746e96103dbcf13d181b3ef75d7f"},"mac":"055dd28e5ca681c07fa5aba08fee6313a94f739fe11bf7c384593b5d11206acf"},"id":"1c8f3b1c-6938-43db-9b41-42d5395487e4","version":3}
    },
    {
      accountName: "Carol",
      accountAddress: "0xe5e609074b7b8b947dcf9cf87805c9192f960a4e",
      privateKey: "0xca3a2b0329b2ed1ce491643917f4b13d1619088f73a03728bb4149ed3fda3fbf",
      encryptedPrivateKey: {"address":"e5e609074b7b8b947dcf9cf87805c9192f960a4e","crypto":{"cipher":"aes-128-ctr","ciphertext":"9ba66130fc7f0f88f7748a0e8d26675094b57a5b041dcf3b3e14122bd85b65b8","cipherparams":{"iv":"be7443f6c1b4bd77bd932d157ac56d05"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"8a5a03d7c7879bcc8dca4d53cde4daad1d31f8ba662209554a304a6abfa5b538"},"mac":"48dd243ff202def6895047fef216921c54262ae55da1d741ed78bf3c89f51de6"},"id":"ada07109-18d3-4163-a934-5807cf5edf1f","version":3}
    }
  ];

  for(const accountInfo of seedAccounts) {
    await accountManager.AddAccount(accountInfo);
  }

  const currentAccount = accountManager.CurrentAccount() || accountManager.Accounts()[Object.keys(accountManager.Accounts())[0]];
  store.dispatch(SwitchAccount({
    client,
    accountManager,
    account: currentAccount,
    noFlash: true
  }));
};
