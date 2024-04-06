import { TransactionReceipt, TransactionResponse } from "ethers";
import { Watcher } from "@/lib/core-utils";

import { Transaction, JsonRpcProvider } from "ethers";
import {
  L1CrossDomainMessenger,
  L2CrossDomainMessenger,
  StateCommitmentChain,
} from "@/typechain-types";

import { getMessagesAndProofsForL2Transaction } from "@/lib/message-relayer";

export interface CrossDomainMessagePair {
  tx: TransactionResponse;
  receipt: TransactionReceipt;
  remoteTx: TransactionResponse;
  remoteReceipt: TransactionReceipt;
}

export enum Direction {
  L1ToL2,
  L2ToL1,
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForXDomainTransaction = async (
  watcher: Watcher,
  tx: Promise<TransactionResponse> | TransactionResponse,
  direction: Direction
): Promise<CrossDomainMessagePair> => {
  const { src, dest } =
    direction === Direction.L1ToL2
      ? { src: watcher.l1, dest: watcher.l2 }
      : { src: watcher.l2, dest: watcher.l1 };

  // await it if needed
  tx = await tx;
  // get the receipt and the full transaction
  const receipt = (await tx.wait())!;
  const fullTx = (await src.provider.getTransaction(tx.hash))!;

  // get the message hash which was created on the SentMessage
  const [xDomainMsgHash] = await watcher.getMessageHashesFromTx(src, tx.hash);
  // Get the transaction and receipt on the remote layer
  const remoteReceipt = (await watcher.getTransactionReceipt(
    dest,
    xDomainMsgHash
  ))!;
  const remoteTx = (await dest.provider.getTransaction(remoteReceipt.hash))!;

  return {
    tx: fullTx,
    receipt,
    remoteTx,
    remoteReceipt,
  };
};

/**
 * Relays all L2 => L1 messages found in a given L2 transaction.
 *
 * @param tx Transaction to find messages in.
 */
export const relayXDomainMessages = async (
  tx: Promise<TransactionResponse> | TransactionResponse,
  l1Provider: JsonRpcProvider,
  l2Provider: JsonRpcProvider,
  l1CrossDomainMessenger: L1CrossDomainMessenger,
  l2CrossDomainMessengerAddress: string,
  l1StateCommitmentChainAddress: string,
  OVM_L2ToL1MessagePasserAddress: string,
  chainId: number
): Promise<void> => {
  tx = await tx;

  let messagePairs = [];
  while (true) {
    try {
      messagePairs = await getMessagesAndProofsForL2Transaction(
        l1Provider,
        l2Provider,
        l1StateCommitmentChainAddress,
        l2CrossDomainMessengerAddress,
        tx.hash,
        OVM_L2ToL1MessagePasserAddress,
        chainId
      );
      break;
    } catch (err: any) {
      if (err.message.includes("unable to find state root batch for tx")) {
        console.log(`no state root batch for tx yet, trying again in 5s...`);
        await sleep(5000);
      } else {
        throw err;
      }
    }
  }
  console.log("Before relayMessage loop");

  for (const { message, proof } of messagePairs) {
    while (true) {
      try {
        const result = await l1CrossDomainMessenger.relayMessage(
          message.target,
          message.sender,
          message.message,
          message.messageNonce,
          proof
        );
        await result.wait();
        break;
      } catch (err: any) {
        if (err.message.includes("execution failed due to an exception")) {
          await sleep(5000);
        } else if (err.message.includes("Nonce too low")) {
          await sleep(5000);
        } else if (err.message.includes("message has already been received")) {
          break;
        } else {
          throw err;
        }
      }
    }
  }
};
