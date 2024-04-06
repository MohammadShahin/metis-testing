import { expect } from "chai";
import {  Wallet } from "ethers";

import { NFT, NFT__factory } from "@/typechain-types";
import { getSigners } from "@/utils/network";
import { getCustomContractAddress } from "@/utils/addresses";
import { getEnvByName } from "@/utils/env";

describe("NFT transactions", function () {
  let nft: NFT;
  let account: Wallet;
  let otherAccount: Wallet;
  let accountTokenIds: number[] = [];
  let otherAccountTokenIds: number[] = [];

  before(async function () {
    // const networkName = getEnvByName("TESTING_CUSTOM_NETWORK_NAME");
    const networkName = "mts_sepolia";
    const signers = getSigners(networkName);
    account = signers[0];
    otherAccount = signers[1];

    nft = NFT__factory.connect(getCustomContractAddress("Nft"), account);
  });

  describe("Deployment", function () {
    it("Should mint a token", async function () {
      const newItemId = Number(await nft.currentTokenId()) + 1;
      accountTokenIds.push(newItemId);
      const tx = await nft.mintTo(account.address);
      await tx.wait();
      expect(await nft.ownerOf(newItemId)).to.equal(account.address);
    });

    it("Should fail if the token is not minted", async function () {
      const newItemId = Number(await nft.currentTokenId()) + 100;
      // await expect(nft.ownerOf(100)).to.be.revertedWithCustomError(
      //   nft,
      //   "ERC721NonexistentToken(uint256)"
      // ).withArgs(100);
      await expect(nft.ownerOf(newItemId)).to.be.reverted;
    });

    it("Should mint a token to another account", async function () {
      const newItemId = Number(await nft.currentTokenId()) + 1;
      otherAccountTokenIds.push(newItemId);
      const tx = await nft.mintTo(otherAccount.address);
      await tx.wait();
      expect(await nft.ownerOf(newItemId)).to.equal(otherAccount.address);
    });

    // transferFrom
    it("Should transfer a token from one account to another and back", async function () {
      const tx = await nft.transferFrom(
        account.address,
        otherAccount.address,
        accountTokenIds[0]
      );
      await tx.wait();
      expect(await nft.ownerOf(accountTokenIds[0])).to.equal(
        otherAccount.address
      );
      // move the token back to the account
      const tx2 = await nft
        .connect(otherAccount)
        .transferFrom(
          otherAccount.address,
          account.address,
          accountTokenIds[0]
        );
      await tx2.wait();
      expect(await nft.ownerOf(accountTokenIds[0])).to.equal(account.address);
    });

    // transferFrom with revert of non-ownership
    it("Should FAIL to transfer a token from one account to another", async function () {
      // await expect(nft.transferFrom(account.address, otherAccount.address, accountTokenId)).to.be.revertedWithCustomError(
      //   nft,
      //   "ERC721IncorrectOwner(address,uint256,address)"
      // );
      await expect(
        nft.transferFrom(
          account.address,
          otherAccount.address,
          otherAccountTokenIds[0]
        )
      ).to.be.reverted;
    });

    // approve
    it("Should approve another account to transfer a token, transfer it and back", async function () {
      const tx = await nft
        .connect(account)
        .approve(otherAccount.address, accountTokenIds[0]);
      await tx.wait();
      expect(await nft.getApproved(accountTokenIds[0])).to.equal(
        otherAccount.address
      );
      // transfer the token
      const tx2 = await nft
        .connect(otherAccount)
        .transferFrom(
          account.address,
          otherAccount.address,
          accountTokenIds[0]
        );
      await tx2.wait();
      expect(await nft.ownerOf(accountTokenIds[0])).to.equal(
        otherAccount.address
      );
      // move the token back to the account
      const tx3 = await nft
        .connect(otherAccount)
        .transferFrom(
          otherAccount.address,
          account.address,
          accountTokenIds[0]
        );
      await tx3.wait();
      expect(await nft.ownerOf(accountTokenIds[0])).to.equal(account.address);
    });

    // call tokenURI
    it("Should get the token URI", async function () {
      const tokenURI = await nft.tokenURI(otherAccountTokenIds[0]);
      console.log("      Token URI: ", tokenURI);
    });
  });
});
