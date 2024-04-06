import { getNetworkContracts } from "@/utils/contracts";
import {
  getChainId,
  getL1L2NetworksConfig,
  getNetworkName,
  getProvider,
  getSigners,
} from "../network";

const xDomainMessengersTestSetup = () => {
  // const chainName = getEnvByName("TESTING_BRIDGE_CHAIN_NAME", "sepolia")!;
  // const l2Protocol = getEnvByName("TESTING_BRIDGE_PROTOCOL", "metis")!;
  const chainName = "sepolia";
  const l2Protocol = "metis";
  const l1Protocol = "eth";
  const networksConfig = getL1L2NetworksConfig(
    l1Protocol,
    l2Protocol,
    chainName
  );
  const l1Tester = getSigners(networksConfig.l1NetworkName)[0];
  const l2Tester = getSigners(networksConfig.l2NetworkName)[1]; // get the second signer for the l2 because the first is L1 tester

  const contracts = getNetworkContracts("sepolia", l1Tester, l2Tester);

  return {
    networksConfig,
    l1Tester,
    l2Tester,
    contracts,
  };
};

export { xDomainMessengersTestSetup };
