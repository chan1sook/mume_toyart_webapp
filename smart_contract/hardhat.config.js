require("hardhat-deploy");
require("hardhat-deploy-ethers");
const { deployer } = require("./deployer.json");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true, // optional, occasionally make tx gas cheaper.
        runs: 200,
      },
    },
  },
  namedAccounts: {
    developer: "0xC70Edf3aB36E0D57eFD8f412A3460D225931A110",
    aon: "0x5572eAA48D9CF8Ae04C7813B5638349d641a7B91",
    muTokenContract: "0xF8d18F1d810af610bd9126230C65dd54B3Cda500",
    // matuTokenContractAccount: "0xB5cF482F8528a445CBF553fd98179e4D766D07a3",
    // matuExchangeContractAccount: "0x06f48166fF6f459BDd570fC64f940cEe6Ba67de0",
  },
  networks: {
    JBC: {
      url: "https://rpc-l1.jibchain.net",
      chainId: 8899,
      accounts: deployer,
    },
  },
};
