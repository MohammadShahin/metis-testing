import {
  ERC20__factory,
  L1StandardBridge__factory,
  Lib_AddressManager__factory,
  MyToken__factory,
  StateCommitmentChain__factory,
} from "@/typechain-types";
import { getNetworkContractAddresses } from "./addresses";
import { ChainName } from "./types";
import { BaseWallet } from "ethers";

const getNetworkContracts = (
  chainName: ChainName,
  l1Singer?: BaseWallet,
  l2Singer?: BaseWallet
) => {
  const networkAddresses = getNetworkContractAddresses(chainName);
  const l1Metis = ERC20__factory.connect(
    networkAddresses.l1MetisAddress,
    l1Singer
  );
  const l2Metis = ERC20__factory.connect(
    networkAddresses.l2MetisAddress,
    l2Singer
  );
  const l2WrappedEth = ERC20__factory.connect(
    networkAddresses.OVM_ETH,
    l2Singer
  );
  const l1Token = MyToken__factory.connect(
    networkAddresses.l1Erc20Token,
    l1Singer
  );
  const l2Token = MyToken__factory.connect(
    networkAddresses.l2Erc20Token,
    l2Singer
  );
  const l1StandardBridge = L1StandardBridge__factory.connect(
    networkAddresses.L1StandardBridge,
    l1Singer
  );
  const stateCommitmentChain = StateCommitmentChain__factory.connect(
    networkAddresses.StateCommitmentChain,
    l1Singer
  );
  const addressManager = Lib_AddressManager__factory.connect(
    networkAddresses.AddressManager,
    l1Singer
  );

  return {
    l1Metis,
    l2Metis,
    l2WrappedEth,
    l1Token,
    l2Token,
    l1StandardBridge,
    stateCommitmentChain,
    addressManager,
    addresses: networkAddresses,
  };
};

export { getNetworkContracts };
