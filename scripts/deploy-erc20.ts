import { MyToken__factory } from "../typechain-types";
import { getEnvByName } from "../utils/env";
import { getSigners } from "../utils/network";

async function main() {
  const name = "MyToken";
  const symbol = "MTK";
  const networkName = getEnvByName("DEPLOY_NETWORK_NAME", "mts_sepolia");
  const [deployer] = getSigners(networkName);
  const myToken = await new MyToken__factory(deployer).deploy(name, symbol);
  const transaction = myToken.deploymentTransaction();
  await transaction?.wait();
  console.log("Transaction hash:", transaction?.hash);
  console.log("Contract deployed to:", await myToken.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
