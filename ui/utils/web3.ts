import devNftAbi1 from "~/assets/jbc-chain/MumeArtToyNftB2.json";
import devNftAbi2 from "~/assets/jbc-chain/MumeArtToyNftB4.json";
import devNftAbi3 from "~/assets/jbc-chain/MumeArtToyNftB5.json";
import devNftAbi4 from "~/assets/jbc-chain/MumeArtToyNftB6.json";

import productionNftAbi1 from "~/assets/jbc-chain/MumeArtToyNft1.json";
import productionNftAbi2 from "~/assets/jbc-chain/MumeArtToyNft2.json";

import devMuAbi1 from "~/assets/jbc-chain/MumeArtToyMuTokenB1.json";
import productionMuAbi1 from "~/assets/jbc-chain/MumeArtToyMuToken.json";

import devClaimMuAbi1 from "~/assets/jbc-chain/ClaimMuFromMumeNftB6Contract.json";
import productionClaimMuAbi1 from "~/assets/jbc-chain/ClaimMuFromMumeNft1Contract.json";
import productionClaimMuAbi2 from "~/assets/jbc-chain/ClaimMuFromMumeNft2Contract.json";

import devLendNftAbi1 from "~/assets/jbc-chain/LendMumeNftB6Contract.json";
import productionLendNftAbi1 from "~/assets/jbc-chain/LendMumeNft1Contract.json";
import productionLendNftAbi2 from "~/assets/jbc-chain/LendMumeNft2Contract.json";

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

export function getMumeNftAbi(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      case 1:
        console.log("NFT Dev Chain: V1 (B2)");
        return devNftAbi1;
      case 2:
        console.log("NFT Dev Chain: V2 (B4)");
        return devNftAbi2;
      case 3:
        console.log("NFT Dev Chain: V3 (B5)");
        return devNftAbi3;
      default:
        console.log("NFT Dev Chain: V4 (B6)");
        return devNftAbi4;
    }
  }

  switch (version) {
    case 1:
      console.log("NFT Production Chain: V1");
      return productionNftAbi1;
    default:
      console.log("NFT Production Chain: V2");
      return productionNftAbi2;
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

export function getMuAbi(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      default:
        console.log("Use Dev Chain: V4 (to B6)");
        return devMuAbi1;
    }
  }

  switch (version) {
    default:
      console.log("Use Production Chain: V1");
      return productionMuAbi1;
  }
}

export function getClaimMuAbi(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      case 1:
      case 2:
      case 3:
        console.log("N/A");
        return null;
      default:
        console.log("ClaimMu Dev Chain: B6");
        return devClaimMuAbi1;
    }
  }

  switch (version) {
    case 1:
      console.log("ClaimMu Production Chain: NFT1");
      return productionClaimMuAbi1;
    default:
      console.log("ClaimMu Production Chain: NFT2");
      return productionClaimMuAbi2;
  }
}

export function getLendNftAbi(devChain: boolean, version: number) {
  if (devChain) {
    switch (version) {
      case 1:
      case 2:
      case 3:
        console.log("N/A");
        return null;
      default:
        console.log("LendNft Dev Chain: B6");
        return devLendNftAbi1;
    }
  }

  switch (version) {
    case 1:
      console.log("LendNft Production Chain: NFT1");
      return productionLendNftAbi1;
    default:
      console.log("LendNft Production Chain: NFT2");
      return productionLendNftAbi2;
  }
}

export function isLendContractAddress(address: string) {
  const addresses = [
    devLendNftAbi1,
    productionLendNftAbi1,
    productionLendNftAbi2,
  ].map((ele) => ele.address.toLowerCase());

  return addresses.includes(address.toLowerCase());
}
