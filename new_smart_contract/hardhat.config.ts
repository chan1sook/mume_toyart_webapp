import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { deployer } from "./deployer.json";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true, // optional, occasionally make tx gas cheaper.
        runs: 200,
      },
    },
  },
  networks: {
    JBC: {
      url: "https://rpc-l1.jibchain.net",
      chainId: 8899,
      accounts: deployer,
    },
  },
};

export default config;
