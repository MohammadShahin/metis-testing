import { VestingVault__factory } from "../typechain-types";
import { getEnvByName } from "../utils/env";
import { getSigners } from "../utils/network";

async function main() {
  const networkName = getEnvByName("DEPLOY_NETWORK_NAME", "mts_sepolia");
  const [deployer] = getSigners(networkName);
  const vesting = await new VestingVault__factory(deployer).deploy();
  const transaction = vesting.deploymentTransaction();
  await transaction?.wait();
  console.log("Transaction hash:", transaction?.hash);
  console.log("Contract deployed to:", await vesting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
