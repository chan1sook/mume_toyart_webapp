import devContractAbi1 from "~/assets/jbc-chain/MumeArtToyNftB2.json";
import devContractAbi2 from "~/assets/jbc-chain/MumeArtToyNftB4.json";
import devContractAbi3 from "~/assets/jbc-chain/MumeArtToyNftB5.json";

import productionAbi from "~/assets/jbc-chain/MumeArtToyNft1.json";

export const jbcchain = {
  chainId: 8899,
  name: "JIBCHAIN",
  currency: "JBC",
  explorerUrl: "https://exp-l1-ng.jibchain.net",
  rpcUrl: "https://rpc-l1.jibchain.net",
};
export const metadata = {
  name: "Mume ArtToy",
  description: "Mume ArtToy Seller Page",
  url: "https://mumearttoy.com",
  icons: [],
};
export const walletConnectId = "80b9309ad284207bd2fcebe5f4fb8a62";

export function getChainAbi(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      case 1:
        console.log("Use Dev Chain: V1 (B2)");
        return devContractAbi1;
      case 2:
        console.log("Use Dev Chain: V2 (B4)");
        return devContractAbi2;
      default:
        console.log("Use Dev Chain: V3 (B5)");
        return devContractAbi3;
    }
  }

  switch (version) {
    default:
      console.log("Use Production Chain: V1");
      return productionAbi;
  }
}
