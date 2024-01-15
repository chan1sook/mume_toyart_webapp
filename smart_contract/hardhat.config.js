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
    mumeNft1Contract: "0x7650339946CfEaE8E8EFe34f85cAbE032612d7b4",
    mumeNft2Contract: "0x85BB3FeAAfFfd526856Eac03E8E8f5d52B752Ca2",
    muTokenContract: "0xF8d18F1d810af610bd9126230C65dd54B3Cda500",

    mumeNftTestContract: "0xf5B8EeAd06e494384eD70B9ea6A191c874841fb8",
    muTokenTestContract: "0x412534E7bBB3FC55833c6d32adc6b4450883F2bc",
  },
  networks: {
    JBC: {
      url: "https://rpc-l1.jibchain.net",
      chainId: 8899,
      accounts: deployer,
    },
  },
};
