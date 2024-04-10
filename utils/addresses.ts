import { ChainName } from "./types";

const customContracts = {
  MultiSend: "0x365E7F371aa20193A00bE7be31cCa41Fa64AfD93",
  MyToken: "0xF3c0942eFa6884B8cac946CbaF50c7EffA77b039",
  Nft: "0xE16f3778ad1331283b4Bc977Bb8Cd9750C12bDeF",
};

const predeploys = {
  OVM_L2ToL1MessagePasser: '0x4200000000000000000000000000000000000000',
  OVM_DeployerWhitelist: '0x4200000000000000000000000000000000000002',
  MVM_ChainConfig: '0x4200000000000000000000000000000000000005',
  L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
  OVM_GasPriceOracle: '0x420000000000000000000000000000000000000F',
  L2StandardBridge: '0x4200000000000000000000000000000000000010',
  OVM_SequencerFeeVault: '0x4200000000000000000000000000000000000011',
  L2StandardTokenFactory: '0x4200000000000000000000000000000000000012',
  OVM_L1BlockNumber: '0x4200000000000000000000000000000000000013',
  MVM_Coinbase: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
  OVM_ETH: '0x420000000000000000000000000000000000000A',
}

const networkContracts = {
  sepolia: {
    // BondManager: "0xE0cDbb071144489b52Af578BDdea84dBDFd85576",
    // CanonicalTransactionChain: "0x5435d351e0aCc874579eC67Ba46440ee6AC892b8",
    // ChainStorageContainer_CTC_batches:
    //   "0x92F90779986C294A22DC43C8f6aE1F5d8B2728E4",
    // ChainStorageContainer_CTC_queue:
    //   "0x10A493fFAc17DCc6Ea70d8c3BD19160ea0d3822B",
    // ChainStorageContainer_SCC_batches:
    //   "0x185AB4701DBf521B44838fa72af99880730d5CE6",
    // L1StandardBridge_for_verification_only:
    //   "0xd41bc137120BFcEd907093741ea402631d7616BE",
    // AddressManager: "0xa66Fa1eD0f1C1ee300893B4eb5493FeAD9a7e9c3",
    // MVM_CanonicalTransaction_for_verification_only:
    //   "0xFD98b95ad84f459697c29aFA75229e93F6D2B8A2",
    // MVM_DiscountOracle: "0x4fd947DfF05a255F78E355C23c8B2E98bf029126",
    // MVM_L2ChainManagerOnL1_for_verification_only:
    //   "0x8c52c668A23970759F21Cbc274fd63C8e4Bdfd4D",
    // MVM_StateCommitmentChain_for_verification_only:
    //   "0xfaAd7fFe832775c66Fb3586f0AF3Ffc09B173ff2",
    // MVM_Verifier_for_verification_only:
    //   "0x88d98AfC2344F9554478C1CDf8062c7F32145176",
    // OVM_L1CrossDomainMessenger: "0x22796245e27190cAFD7b50a93585f30f60a03f46",
    // Proxy__MVM_CanonicalTransaction:
    //   "0x6281F34652359cfBa1781D84DAb939f99aaa0e29",
    // Proxy__MVM_ChainManager: "0xEf3375Fc36007a585Ee6e73BF95797273f4F9b49",
    Proxy__MVM_StateCommitmentChain:
      "0x9DCC53737FcB3E86a17CF435ca3c15390D4FC7Ed",
    // Proxy__MVM_Verifier: "0x1B9B31E637278c207991F6e96074928728359A10",
    // Proxy__OVM_L1CrossDomainMessenger:
    //   "0x4542c621eEe9fC533c2e6bd80880C89990EE10cD",
    // Proxy__OVM_L1StandardBridge: "0x9848dE505e6Aa301cEecfCf23A0a150140fc996e",

    // StateCommitmentChain: "0xA059B3307f534943Ee6c710D9582B42543847Eb1",
    L1CrossDomainMessenger: "0x4542c621eEe9fC533c2e6bd80880C89990EE10cD",
    CanonicalTransactionChain: "0x5435d351e0aCc874579eC67Ba46440ee6AC892b8",
    AddressManager: "0xa66Fa1eD0f1C1ee300893B4eb5493FeAD9a7e9c3",
    L1StandardBridge: "0x9848dE505e6Aa301cEecfCf23A0a150140fc996e",

    // metis
    L1Metis: "0x7f49160EB9BB068101d445fe77E17ecDb37D0B47",
    L2Metis: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",

    // erc20 token
    L1Erc20Token: "0x000C1724778158D9f67292F54E2e791F53a51737",
    L2Erc20Token: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",

    ...predeploys,
  },

  // todo add the contract addresses for the mainnet
  mainnet: {
    Proxy__MVM_StateCommitmentChain:
      "0x9DCC53737FcB3E86a17CF435ca3c15390D4FC7Ed",
    L1CrossDomainMessenger: "",
    CanonicalTransactionChain: "",
    AddressManager: "",
    L1StandardBridge: "",

    L1Metis: "",
    L2Metis: "",

    L1Erc20Token: "",
    L2Erc20Token: "",
    
    ...predeploys,
  },
};


export type ValidCustomContracts = keyof typeof customContracts;
export type ValidNetworkContracts = keyof typeof networkContracts[ChainName];

const getCustomContractAddress = (contractName: ValidCustomContracts) => {
  return customContracts[contractName];
};

const getNetworkContractAddresses = (
  chainName: ChainName
) => {
  return networkContracts[chainName];
};

export { getCustomContractAddress, getNetworkContractAddresses };
