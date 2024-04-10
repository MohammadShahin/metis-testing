import { assert, expect } from "chai";

import {
  Direction,
  relayXDomainMessages,
  waitForXDomainTransaction,
} from "@/utils/watcher";
import { Watcher } from "@/lib/core-utils";

import { parseEther, TransactionResponse } from "ethers";
import { xDomainMessengersTestSetup } from "@/utils/test/setup";

let withdrawMetisTxResponse: TransactionResponse;
let withdrawEtherTxResponse: TransactionResponse;
let withdrawTokensTxResponse: TransactionResponse;

async function getContext() {
  const xDomainSetup = xDomainMessengersTestSetup();
  const watcher = new Watcher({
    l1: {
      provider: xDomainSetup.networksConfig.l1Provider,
      messengerAddress: xDomainSetup.contracts.addresses.L1CrossDomainMessenger,
    },
    l2: {
      provider: xDomainSetup.networksConfig.l2Provider,
      messengerAddress: xDomainSetup.contracts.addresses.L2CrossDomainMessenger,
    },
  });
  const {
    l1Tester,
    networksConfig: { l1Provider, l2Provider },
    contracts: { l1Metis, l2WrappedEth, l1Token, l2Token },
  } = xDomainSetup;
  const initL1MetisBalance = await l1Metis.balanceOf(l1Tester.address);
  const initL2MetisBalance = await l2Provider.getBalance(l1Tester.address);

  const initL1EtherBalance = await l1Provider.getBalance(l1Tester.address);
  const initL2EtherBalance = await l2WrappedEth.balanceOf(l1Tester.address);

  const initL1TokenBalance = await l1Token.balanceOf(l1Tester.address);
  const initL2TokenBalance = await l2Token.balanceOf(l1Tester.address);

  const l1Gas = 5000000;
  const withdrawTransactionValue = parseEther("0.1");

  return {
    initL1MetisBalance,
    initL2MetisBalance,
    initL1EtherBalance,
    initL2EtherBalance,
    initL1TokenBalance,
    initL2TokenBalance,
    l1Gas,
    withdrawTransactionValue,
    watcher,
    withdrawAmount: parseEther("0.00025"),
    ...xDomainSetup,
  };
}
describe("Bridging via withdraw E2E test", function () {
  let context: Awaited<ReturnType<typeof getContext>>;

  before(async function () {
    context = await getContext();
  });

  describe("Withdraw Metis", function () {
    it("Withdraw metis tokens from L2 via withdraw", async function () {
      const {
        contracts: { l2StandardBridge },
        withdrawAmount,
        l1Gas,
        withdrawTransactionValue,
      } = context;
      withdrawMetisTxResponse = await l2StandardBridge.withdrawMetis(
        withdrawAmount,
        l1Gas,
        "0x",
        { value: withdrawTransactionValue }
      );

      await withdrawMetisTxResponse.wait();
    });

    it("Relay the L2 => L1 message", async () => {
      const {
        networksConfig: { l1Provider, l2Provider, l2ChainId },
        contracts: {
          l1CrossDomainMessenger,
          addresses: {
            L2CrossDomainMessenger,
            Proxy__MVM_StateCommitmentChain,
            OVM_L2ToL1MessagePasser,
          },
        },
      } = context;

      const txHash =
        "0x4bff3080a550ca50d200ba5e77bb3791164294f6c77278f9518ad0852031ccf8";
      withdrawMetisTxResponse = (await l2Provider.getTransaction(txHash))!;
      await relayXDomainMessages(
        withdrawMetisTxResponse,
        l1Provider,
        l2Provider,
        l1CrossDomainMessenger,
        L2CrossDomainMessenger,
        Proxy__MVM_StateCommitmentChain,
        OVM_L2ToL1MessagePasser,
        l2ChainId
      );
    });

    it("Receipt with a status of 1 for a successful message", async () => {
      const { watcher } = context;
      const { remoteReceipt } = await waitForXDomainTransaction(
        watcher,
        withdrawMetisTxResponse,
        Direction.L2ToL1
      );
      assert.equal(remoteReceipt.status, 1);
    });

    it("Check the balances after the withdrawal", async () => {
      const {
        networksConfig: { l1Provider, l2Provider },
        contracts: { l1Metis },
        l2Tester,
        initL1MetisBalance,
        initL2MetisBalance,
        withdrawAmount
      } = context;
      const l1MetisBalance = await l1Metis.balanceOf(l2Tester.address);
      const l2MetisBalance = await l2Provider.getBalance(l2Tester.address);

      expect(l1MetisBalance).to.be.eq(initL1MetisBalance + withdrawAmount);
      expect(l2MetisBalance).to.lt(initL2MetisBalance - withdrawAmount);
    });
  });

  describe("Withdraw Ether", function () {});

  describe("Withdraw Tokens", function () {});
});
