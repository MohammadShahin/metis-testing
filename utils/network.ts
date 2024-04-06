import hre from "hardhat";
import { JsonRpcProvider, Wallet } from "ethers";
import { getSignersPrivateKeys, getNetworkName as getNetworkNameEnv } from "./env";
import { ChainName, Protocol } from "./types";

const networksInfo = {
  eth: {
    mainnet: {
      chainId: 1,
      name: "eth_mainnet",
    },
    sepolia: {
      chainId: 11155111,
      name: "eth_sepolia",
    },
  },
  metis: {
    mainnet: {
      chainId: 1088,
      name: "mts_mainnet",
    },
    sepolia: {
      chainId: 59902,
      name: "mts_sepolia",
    },
  },
}

const getNetwork = (networkName?: string) => {
  if (!networkName) networkName = getNetworkNameEnv() ?? "mts_sepolia";
  return hre.config.networks[networkName];
};

const getProvider = (networkName?: string) => {
  const network = getNetwork(networkName);
  // @ts-ignore
  return new JsonRpcProvider(network.url);
};

const getSigners = (networkName?: string) => {
  const provider = getProvider(networkName);
  const signers = getSignersPrivateKeys().map(
    (signer) => new Wallet(signer, provider)
  );
  return signers;
};

const getChainId = (protocol: Protocol, chainName: ChainName) => {
  return networksInfo[protocol][chainName].chainId;
};

const getNetworkName = (protocol: Protocol, chainName: ChainName) => {
  return networksInfo[protocol][chainName].name;
};

const getL1L2NetworksConfig = (l1Protocol: Protocol, l2Protocol: Protocol, chainName: ChainName) => {
  const l1NetworkName = getNetworkName(l1Protocol, chainName);
  const l2NetworkName = getNetworkName(l2Protocol, chainName);
  const l1Provider = getProvider(l1NetworkName);
  const l2Provider = getProvider(l2NetworkName);
  const l1ChainId = getChainId(l1Protocol, chainName);
  const l2ChainId = getChainId(l2Protocol, chainName);
  return {
    l1NetworkName,
    l2NetworkName,
    l1Provider, 
    l2Provider,
    l1ChainId,
    l2ChainId,
  };
}

export { getNetwork, getProvider, getSigners, getChainId, getNetworkName, getL1L2NetworksConfig };
