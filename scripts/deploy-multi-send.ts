import { MultiSend__factory } from "../typechain-types";
import { getEnvByName } from "../utils/env";
import { getSigners } from "../utils/network";

async function main() {
  const networkName = getEnvByName("DEPLOY_NETWORK_NAME", "mts_sepolia");
  const [deployer] = getSigners(networkName);
  const multiSend = await new MultiSend__factory(deployer).deploy();
  const transaction = multiSend.deploymentTransaction();
  await transaction?.wait();
  console.log("Transaction hash:", transaction?.hash);
  console.log("Contract deployed to:", await multiSend.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
