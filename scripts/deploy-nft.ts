import { NFT__factory } from "../typechain-types";
import { getEnvByName } from "../utils/env";
import { getSigners } from "../utils/network";

async function main() {
  const name = "myNFT";
  const symbol = "mNFT";
  const networkName = getEnvByName("DEPLOY_NETWORK_NAME", "mts_sepolia");
  const [deployer] = getSigners(networkName);
  const nft = await new NFT__factory(deployer).deploy(name, symbol);
  const transaction = nft.deploymentTransaction();
  await transaction?.wait();
  console.log("Transaction hash:", transaction?.hash);
  console.log("Contract deployed to:", await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
