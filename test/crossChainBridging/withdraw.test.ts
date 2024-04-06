import { assert, expect } from "chai";

import { Direction, waitForXDomainTransaction } from "@/utils/watcher";
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

  return {
    initL1MetisBalance,
    initL2MetisBalance,
    initL1EtherBalance,
    initL2EtherBalance,
    initL1TokenBalance,
    initL2TokenBalance,
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

  describe("Withdraw Metis", function () {});

  describe("Withdraw Ether", function () {});

  describe("Withdraw Tokens", function () {});
});
