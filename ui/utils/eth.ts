import devContractAbi1 from "~/assets/jbc-chain/MumeArtToyNftB2.json";
import devContractAbi2 from "~/assets/jbc-chain/MumeArtToyNftB4.json";
import devContractAbi3 from "~/assets/jbc-chain/MumeArtToyNftB5.json";
import devContractAbi4 from "~/assets/jbc-chain/MumeArtToyNftB6.json";

import productionAbi1 from "~/assets/jbc-chain/MumeArtToyNft1.json";
import productionAbi2 from "~/assets/jbc-chain/MumeArtToyNft2.json";

import muAbi from "~/assets/jbc-chain/MumeArtToyMuToken.json";

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
      case 3:
        console.log("Use Dev Chain: V3 (B5)");
        return devContractAbi3;
      default:
        console.log("Use Dev Chain: V4 (B6)");
        return devContractAbi4;
    }
  }

  switch (version) {
    case 1:
      console.log("Use Production Chain: V1");
      return productionAbi1;
    default:
      console.log("Use Production Chain: V2");
      return productionAbi2;
  }
}

export function getCodeSignatureByChain(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      case 1:
      case 2:
      case 3:
        return 1;
      default:
        return 2;
    }
  }

  switch (version) {
    case 1:
      return 1;
    default:
      return 2;
  }
}
export function getPrettyChainName(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      case 1:
        return "MATN-B2";
      case 2:
        return "MATN-B4";
      case 3:
        return "MATN-B5";
      default:
        return "MATN-B6";
    }
  }

  switch (version) {
    case 1:
      return "MATN1";
    default:
      return "MATN2";
  }

  return `MATN${version}`;
}

export function getMuAbi() {
  return muAbi;
}
