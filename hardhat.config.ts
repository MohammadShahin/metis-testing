import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "tsconfig-paths/register";

import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: false,
            // runs: 100_000,
          },
          evmVersion: "berlin",
        },
      },
    ],
  },
  networks: {
    eth_sepolia: {
      url: process.env['ETH_SEPOLIA_RPC_URL'],
    },
    mts_sepolia: {
      url: process.env['MTS_SEPOLIA_RPC_URL'],
    },
  },

  typechain: {
    externalArtifacts: [
      "./interfaces/*.json",
    ],
  },
  mocha: {
    timeout: 70 * 60 * 60 * 1000, // 70 minutes for e2e tests
  },
};

export default config;
