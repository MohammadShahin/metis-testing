import {
  ERC20__factory,
  L1CrossDomainMessenger__factory,
  L1StandardBridge__factory,
  L2StandardBridge__factory,
  Lib_AddressManager__factory,
  MyToken__factory,
  StateCommitmentChain__factory,
} from "@/typechain-types";
import { getNetworkContractAddresses } from "./addresses";
import { ChainName } from "./types";
import { BaseWallet } from "ethers";

const contractFactories = {
  L1: [
    {
      addressName: "L1Metis",
      factory: ERC20__factory,
      contractName: "l1Metis",
    },
    {
      addressName: "L1Erc20Token",
      factory: MyToken__factory,
      contractName: "l1Token",
    },
    {
      addressName: "L1StandardBridge",
      factory: L1StandardBridge__factory,
      contractName: "l1StandardBridge",
    },
    {
      addressName: "Proxy__MVM_StateCommitmentChain",
      factory: StateCommitmentChain__factory,
      contractName: "stateCommitmentChain",
    },
    {
      addressName: "AddressManager",
      factory: Lib_AddressManager__factory,
      contractName: "addressManager",
    },
    {
      addressName: "L1CrossDomainMessenger",
      factory: L1CrossDomainMessenger__factory,
      contractName: "l1CrossDomainMessenger",
    },
  ],
  L2: [
    {
      addressName: "L2Metis",
      factory: ERC20__factory,
      contractName: "l2Metis",
    },
    {
      addressName: "OVM_ETH",
      factory: ERC20__factory,
      contractName: "l2WrappedEth",
    },
    {
      addressName: "L2Erc20Token",
      factory: MyToken__factory,
      contractName: "l2Token",
    },
    {
      addressName: "L2StandardBridge",
      factory: L2StandardBridge__factory,
      contractName: "l2StandardBridge",
    },
  ],
} as const;

type ContractDefinition =
  | (typeof contractFactories.L1)[number]
  | (typeof contractFactories.L2)[number];

type Contracts = {
  [K in ContractDefinition["contractName"]]: ReturnType<
    Extract<ContractDefinition, { contractName: K }>["factory"]["connect"]
  >;
};

const getNetworkContracts = (
  chainName: ChainName,
  l1Signer?: BaseWallet,
  l2Signer?: BaseWallet
) => {
  const networkAddresses = getNetworkContractAddresses(chainName);
  const contracts = {} as Contracts;
  for (const { addressName, contractName, factory } of contractFactories.L1) {
    // @ts-ignore
    contracts[contractName] = factory.connect(
      networkAddresses[addressName],
      l1Signer
    );
  }

  for (const { addressName, contractName, factory } of contractFactories.L2) {
    // @ts-ignore
    contracts[contractName] = factory.connect(
      networkAddresses[addressName as keyof typeof networkAddresses],
      l2Signer
    );
  }

  return {
    ...contracts,
    addresses: networkAddresses,
  };
};

export { getNetworkContracts };
