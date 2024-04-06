import { expect } from "chai";
import {
  JsonRpcProvider,
  parseEther,
  BaseWallet,
} from "ethers";

import { getSigners } from "@/utils/network";
import { MultiSend, MultiSend__factory } from "@/typechain-types";
import { getCustomContractAddress } from "@/utils/addresses";
import { getEnvByName } from "@/utils/env";

describe("Native token transactions", function () {
  let sender: BaseWallet;
  let receivers: string[];
  let provider: JsonRpcProvider;
  let transferValue = parseEther((0.01).toString());
  let multiTransferValues = [0.011, 0.012, 0.013];
  let multiSendContract: MultiSend;

  before(async function () {
    // const networkName = getEnvByName("TESTING_CUSTOM_NETWORK_NAME");
    const networkName = "mts_sepolia";
    const signers = getSigners(networkName);
    sender = signers[0];
    provider = sender.provider as JsonRpcProvider;
    // random wallets for testing multiple transfers
    receivers = [
      "0xe8b9396D5eae2245C3Aee24de8a97B4A661481FB",
      "0x49137f3F26a5742eed35Cd01D6585b4C99c40218",
      "0x2B426ecc6F8CF8a0486051879912e16e4151E36c",
    ];
    multiSendContract = MultiSend__factory.connect(
      getCustomContractAddress("MultiSend"),
      sender
    );
  });

  describe("Single Transfers", function () {
    it("Sender should have enough balance", async function () {
      const accountBalance = await provider.getBalance(sender);
      expect(accountBalance).to.be.gt(transferValue);
    });

    it("Should transfer from one account to another", async function () {
      const senderBalance = await provider.getBalance(sender.address);
      const receiverBalance = await provider.getBalance(receivers[0]);
      const tx = await sender.sendTransaction({
        to: receivers[0],
        value: transferValue,
      });
      await tx.wait();
      const newSenderBalance = await provider.getBalance(sender.address);
      const newOtherReceiverBalance = await provider.getBalance(receivers[0]);
      expect(newSenderBalance).to.be.lt(senderBalance);
      expect(newOtherReceiverBalance).to.be.gt(receiverBalance + transferValue);
    });
  });

  describe("Multiple Transfers (with smart contract)", function () {
    it("should have enough balance", async function () {
      const accountBalance = await provider.getBalance(sender.address);
      expect(accountBalance).to.be.gt(
        parseEther(multiTransferValues.reduce((a, b) => a + b).toString())
      );
    });

    it("Should fail to transfer to many because destination and value arrays are not the same length", async function () {
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const tx = multiSendContract.sendMultiNativeToken(
        receivers.slice(1),
        multiTransferValues.map((value) => parseEther(value.toString())),
        {
          value: parseEther(valueSum.toString()),
        }
      );
      await expect(tx).to.be.reverted;
    });

    it("Should fail to transfer to many because the sender does not send enough balance", async function () {
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const tx = multiSendContract.sendMultiNativeToken(
        receivers,
        multiTransferValues.map((value) => parseEther(value.toString())),
        {
          value: parseEther((valueSum - 0.001).toString()),
        }
      );
      await expect(tx).to.be.reverted;
    });

    it("Should transfer to many accounts in the same tx", async function () {
      const senderBalance = await provider.getBalance(sender.address);
      const receiversBalances = await Promise.all(
        receivers.map(async (receiver) => await provider.getBalance(receiver))
      );
      const valueSum = multiTransferValues.reduce((a, b) => a + b);
      const tx = await multiSendContract.sendMultiNativeToken(
        receivers,
        multiTransferValues.map((value) => parseEther(value.toString())),
        {
          value: parseEther(valueSum.toString()),
        }
      );
      await tx.wait();
      const newSenderBalance = await provider.getBalance(sender.address);
      const newReceiverBalances = await Promise.all(
        receivers.map(async (receiver) => await provider.getBalance(receiver))
      );
      expect(newSenderBalance).to.be.lt(senderBalance);
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
