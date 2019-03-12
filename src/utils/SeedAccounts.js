import {SwitchAccount} from "../actions/Accounts";

export const SeedAccounts = async (store, client, accountManager) => {
  /*
  const seedAccounts = [
    {
      accountName: "Alice",
      accountAddress: "0x71b011b67dc8f5c323a34cd14b952721d5750c93",
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      encryptedPrivateKey: {"address":"71b011b67dc8f5c323a34cd14b952721d5750c93","id":"5b9200df-dd37-40f1-9213-9cb400888c12","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"b9ed36c1721f3516156cf1af407b7a6e"},"ciphertext":"2e9913353b620103e47e2f38d25b6c99591e10fb2c2d150c8add68bfa18b7995","kdf":"scrypt","kdfparams":{"salt":"1672c084291cb0345b0f4af453e0de6c74cb7c33eda0899f3c56c221500c41ab","n":16384,"dklen":32,"p":1,"r":8},"mac":"5f822050541508c07e9a1445fab891adc6aa84666234be443c7a34da484ad2bb"}},
      password: "test"
    },
    {
      accountName: "Bob",
      accountAddress: "0x1cb99a5e4ccead43e98f61d25932bca5bf572484",
      privateKey: "0x2d953561666c11a5bec2b9d5fd1203f21eb0aff02b074daa4897fee6b4726a98",
      encryptedPrivateKey: {"address":"1cb99a5e4ccead43e98f61d25932bca5bf572484","id":"9321ff42-2df3-4614-ac26-2bfe82480822","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"03db7cf41af681252e2142053eab145e"},"ciphertext":"cf9e77087f9d8f5858d313ff372fd933796d2d4dccb4626d3446278069904bf9","kdf":"scrypt","kdfparams":{"salt":"bf024c4df7d15f72689ded7679e730660556c70625c24878c81aa2f4a2d1e800","n":16384,"dklen":32,"p":1,"r":8},"mac":"bf1c8efc9e1b99db8eb696a3a0758bfd8cd911abc3639b45d55ed8cb54eff812"}},
      password: "test"
    },
    {
      accountName: "Carol",
      accountAddress: "0xe5e609074b7b8b947dcf9cf87805c9192f960a4e",
      privateKey: "0xca3a2b0329b2ed1ce491643917f4b13d1619088f73a03728bb4149ed3fda3fbf",
      encryptedPrivateKey: {"address":"e5e609074b7b8b947dcf9cf87805c9192f960a4e","id":"493f6d6a-fb47-4034-8545-0fe265c388c5","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"4f4ffe5aaae1a0f415800a5854def972"},"ciphertext":"6a866a9b9e8bc652173779c74f4537a2d6bd4a7ec694498f32dcdfad09381c43","kdf":"scrypt","kdfparams":{"salt":"1954082d8a5488912394a7b61e5fc9785a346fef2673b5070059e86ae898a467","n":16384,"dklen":32,"p":1,"r":8},"mac":"494c9f4623dc5261bec1bdaebff35901d145245121e048310844018b9b8abe90"}},
      password: "test"
    }
  ];

  for(const accountInfo of seedAccounts) {
    await accountManager.AddAccount(accountInfo);
  }
  */

  const currentAccount = accountManager.CurrentAccount() || accountManager.Accounts()[Object.keys(accountManager.Accounts())[0]];

  store.dispatch(SwitchAccount({
    client,
    accountManager,
    account: currentAccount,
    noFlash: true
  }));
};
