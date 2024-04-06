import { expect } from "chai";
import { parseEther, BaseWallet } from "ethers";
import { getSigners } from "@/utils/network";
import "@/utils/addresses";
import {
  MultiSend,
  MultiSend__factory,
  MyToken,
  MyToken__factory,
} from "@/typechain-types";

import { getCustomContractAddress } from "@/utils/addresses";
import { getEnvByName } from "@/utils/env";

describe("ERC20 token transactions", function () {
  let sender: BaseWallet;
  let receivers: string[];
  let transferValue = 0.01;
  let multiTransferValues = [0.011, 0.012, 0.013];
  let multiSendContract: MultiSend;
  let multiSendAddress: string;
  let tokenContract: MyToken;
  let tokenAddress: string;

  before(async function () {
    // const networkName = getEnvByName("TESTING_CUSTOM_NETWORK_NAME");
    const networkName = "mts_sepolia";
    const signers = getSigners(networkName);
    sender = signers[0];
    // random wallets for testing multiple transfers
    receivers = [
      "0xe8b9396D5eae2245C3Aee24de8a97B4A661481FB",
      "0x49137f3F26a5742eed35Cd01D6585b4C99c40218",
      "0x2B426ecc6F8CF8a0486051879912e16e4151E36c",
    ];
    multiSendAddress = getCustomContractAddress("MultiSend");
    multiSendContract = MultiSend__factory.connect(
      getCustomContractAddress("MultiSend"),
      sender
    );
    tokenAddress = getCustomContractAddress("MyToken");
    tokenContract = MyToken__factory.connect(
      getCustomContractAddress("MyToken"),
      sender
    );
  });

  it("should send all token to receiver", async function () {
    const approveTx = await tokenContract.approve(multiSendAddress, 0n);
    await approveTx.wait();
    const accountBalanceBefore = await tokenContract.balanceOf(sender.address);
    const tx = await tokenContract.transfer(receivers[0], accountBalanceBefore);
    await tx.wait();
    const accountBalance = await tokenContract.balanceOf(sender.address);
    expect(accountBalance).to.be.eq(0n);
  });

  describe("Token Metadata", function () {
    it("Should have the correct name and symbol", async function () {
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      expect(name).to.equal("MyToken");
      expect(symbol).to.equal("MTK");
    });
  });

  describe("Single Transfers", function () {
    it("Mint to sender the exact amount needed", async function () {
      const accountBalanceBefore = await tokenContract.balanceOf(
        sender.address
      );
      const tx = await tokenContract.mint(
        sender.address,
        parseEther(transferValue.toString())
      );
      await tx.wait();
      const accountBalance = await tokenContract.balanceOf(sender.address);
      expect(accountBalance).to.be.eq(
        accountBalanceBefore + parseEther(transferValue.toString())
      );
    });

    it("Should transfer from one account to another", async function () {
      const senderBalance = await tokenContract.balanceOf(sender.address);
      const receiverBalance = await tokenContract.balanceOf(receivers[0]);
      const tx = await tokenContract.transfer(
        receivers[0],
        parseEther(transferValue.toString())
      );
      await tx.wait();
      const newSenderBalance = await tokenContract.balanceOf(sender.address);
      const newOtherReceiverBalance = await tokenContract.balanceOf(
        receivers[0]
      );
      expect(newSenderBalance).to.be.eq(
        senderBalance - parseEther(transferValue.toString())
      );
      expect(newOtherReceiverBalance).to.be.eq(
        receiverBalance + parseEther(transferValue.toString())
      );
    });
  });

  describe("Multiple Transfers (with smart contract)", function () {
    it("should mint the exact amount", async function () {
      const accountBalanceBefore = await tokenContract.balanceOf(
        sender.address
      );
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const tx = await tokenContract.mint(
        sender.address,
        parseEther(valueSum.toString())
      );
      await tx.wait();
      const accountBalance = await tokenContract.balanceOf(sender.address);
      expect(accountBalance).to.be.eq(
        accountBalanceBefore + parseEther(valueSum.toString())
      );
    });

    it("should approve half the amount", async function () {
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const halfValues = parseEther(valueSum.toString()) / 2n;
      const tx = await tokenContract.approve(multiSendAddress, halfValues);
      await tx.wait();
      const allowance = await tokenContract.allowance(
        sender.address,
        multiSendAddress
      );
      expect(allowance).to.be.eq(halfValues);
    });

    it("Should fail to transfer to many because sender doesn't approve enough tokens", async function () {
      const tx = multiSendContract.sendMultiToken(
        tokenAddress,
        receivers,
        multiTransferValues.map((value) => parseEther(value.toString()))
      );
      await expect(tx).to.be.reverted;
    });

    it("should approve the contract to spend the other half the tokens", async function () {
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const valueSumBigNumber = parseEther(valueSum.toString());
      const tx = await tokenContract.approve(
        multiSendAddress,
        valueSumBigNumber
      );
      await tx.wait();
      const allowance = await tokenContract.allowance(
        sender.address,
        multiSendAddress
      );
      expect(allowance).to.be.eq(valueSumBigNumber);
    });

    it("Should fail to transfer to many because destination and value arrays are not the same length", async function () {
      const tx = multiSendContract.sendMultiToken(
        tokenAddress,
        receivers.slice(1),
        multiTransferValues.map((value) => parseEther(value.toString()))
      );
      await expect(tx).to.be.reverted;
    });

    it("Should transfer to many accounts in the same tx", async function () {
      const senderBalance = await tokenContract.balanceOf(sender.address);
      const receiversBalances = await Promise.all(
        receivers.map(
          async (receiver) => await tokenContract.balanceOf(receiver)
        )
      );
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const tx = await multiSendContract.sendMultiToken(
        tokenAddress,
        receivers,
        multiTransferValues.map((value) => parseEther(value.toString()))
      );
      await tx.wait();
      const newSenderBalance = await tokenContract.balanceOf(sender.address);
      const newReceiverBalances = await Promise.all(
        receivers.map(
          async (receiver) => await tokenContract.balanceOf(receiver)
        )
      );
      expect(newSenderBalance).to.be.eq(
        senderBalance - parseEther(valueSum.toString())
      );
      expect(newReceiverBalances).to.have.length(receivers.length);
      newReceiverBalances.forEach((balance, index) => {
        // check the change in balance
        expect(balance).to.be.eq(
          receiversBalances[index] +
            parseEther(multiTransferValues[index].toString())
        );
      });
    });
  });
});
