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
    deployer: 0,
  },
  networks: {
    JBC: {
      url: "https://rpc-l1.jibchain.net",
      chainId: 8899,
      accounts: deployer,
    },
  },
};
