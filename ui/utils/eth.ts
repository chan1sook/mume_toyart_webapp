import demoContractABI from "~/assets/jbc-chain/MumeArtToyTestNft.json";

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

export function getChainAbi(realChain?: boolean) {
  return demoContractABI;
}
