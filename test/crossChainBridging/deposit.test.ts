import { assert, expect } from "chai";

import { Direction, waitForXDomainTransaction } from "@/utils/watcher";
import { Watcher } from "@/lib/core-utils";

import { parseEther, TransactionResponse } from "ethers";
import { xDomainMessengersTestSetup } from "@/utils/test/setup";

let depositMetisTxResponse: TransactionResponse;
let depositEtherTxResponse: TransactionResponse;
let depositTokensTxResponse: TransactionResponse;

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
    depositAmount: parseEther("0.00025"),
    ...xDomainSetup,
  };
}

describe("Bridging via deposit E2E test", function () {
  let context: Awaited<ReturnType<typeof getContext>>;

  before(async function () {
    context = await getContext();
  });

  describe("Deposit Metis", function () {
    it("Set allowance for L1ERC20TokenBridge to deposit", async function () {
      const l1Metis = context.contracts.l1Metis;
      const approver = context.l1Tester;
      const l1StandardBridgeAddress =
        context.contracts.addresses.L1StandardBridge;
      const depositAmount = context.depositAmount;
      const allowanceTxResponse = await l1Metis
        .connect(approver)
        .approve(l1StandardBridgeAddress, depositAmount);

      await allowanceTxResponse.wait();

      assert.equal(
        await l1Metis.allowance(approver.address, l1StandardBridgeAddress),
        depositAmount
      );
    });

    it("Bridge metis tokens from L1 to L2 via depositERC20ByChainId", async function () {
      const {
        contracts: {
          l1StandardBridge,
          addresses: { L1Metis, L2Metis },
        },
        depositAmount,
        networksConfig: { l2ChainId },
      } = context;
      const l2Gas = 5000000;
      depositMetisTxResponse = await l1StandardBridge.depositERC20ByChainId(
        l2ChainId,
        L1Metis,
        L2Metis, // this doesn't matter because we are bridging metis
        depositAmount,
        l2Gas,
        "0x",
        {
          value: parseEther("0.0025"),
        }
      );

      await depositMetisTxResponse.wait();
    });

    it("Receipt with a status of 1 for a successful message", async function () {
      const { remoteReceipt } = await waitForXDomainTransaction(
        context.watcher,
        depositMetisTxResponse,
        Direction.L1ToL2
      );
      assert.equal(remoteReceipt.status, 1);
    });

    it("Check balances", async function () {
      const { l1Metis } = context.contracts;
      const {
        l1Tester,
        depositAmount,
        initL2MetisBalance,
        initL1MetisBalance,
      } = context;
      const l2Provider = context.networksConfig.l2Provider;
      const l1Balance = await l1Metis.balanceOf(l1Tester.address);
      const l2Balance = await l2Provider.getBalance(l1Tester.address);

      console.log("        L1 Metis Balance:  ", l1Balance.toString());
      console.log("        L2 Metis Balance:  ", l2Balance.toString());
      expect(l1Balance).to.be.eq(initL1MetisBalance - depositAmount);
      expect(l2Balance).to.be.eq(initL2MetisBalance + depositAmount);
    });
  });

  describe("Deposit Ether", function () {
    it("Bridge ether from L1 to L2 via depositETH", async function () {
      const {
        contracts: { l1StandardBridge },
        depositAmount,
        networksConfig: { l2ChainId },
      } = context;
      const l2Gas = 1; // this can be whatever since oracle.getDiscount() is zero on testnet
      depositEtherTxResponse = await l1StandardBridge.depositETHByChainId(
        l2ChainId,
        l2Gas,
        "0x",
        {
          value: depositAmount,
        }
      );

      depositEtherTxResponse.wait();
    });

    it("Receipt with a status of 1 for a successful message", async function () {
      const { remoteReceipt } = await waitForXDomainTransaction(
        context.watcher,
        depositEtherTxResponse,
        Direction.L1ToL2
      );
      assert.equal(remoteReceipt.status, 1);
    });

    it("Check balances", async function () {
      const {
        l1Tester,
        initL1EtherBalance,
        initL2EtherBalance,
        depositAmount,
        networksConfig: { l1Provider },
        contracts: { l2WrappedEth },
      } = context;
      const l1Balance = await l1Provider.getBalance(l1Tester.address);
      const l2Balance = await l2WrappedEth.balanceOf(l1Tester.address);
      expect(l1Balance).to.be.lt(initL1EtherBalance - depositAmount);
      expect(l2Balance).to.be.eq(initL2EtherBalance + depositAmount);
    });
  });

  describe("Deposit Tokens", function () {
    it("Mint tokens to L1 tester", async function () {
      const {
        contracts: { l1Token },
        l1Tester,
        depositAmount,
      } = context;
      const mintTxResponse = await l1Token.mint(
        l1Tester.address,
        depositAmount
      );

      await mintTxResponse.wait();
    });

    it("Set allowance for L1ERC20TokenBridge to deposit", async function () {
      const {
        contracts: { l1Token },
        l1Tester,
        depositAmount,
      } = context;
      const l1StandardBridgeAddress =
        context.contracts.addresses.L1StandardBridge;
      const allowanceTxResponse = await l1Token
        .connect(l1Tester)
        .approve(l1StandardBridgeAddress, depositAmount);

      await allowanceTxResponse.wait();

      assert.equal(
        await l1Token.allowance(l1Tester.address, l1StandardBridgeAddress),
        depositAmount
      );
    });

    it("Bridge tokens from L1 to L2 via depositERC20ByChainId", async function () {
      const {
        contracts: {
          l1StandardBridge,
          addresses: { L1Erc20Token, L2Erc20Token },
        },
        depositAmount,
        networksConfig: { l2ChainId },
      } = context;
      const l2Gas = 5000000;
      depositTokensTxResponse = await l1StandardBridge.depositERC20ByChainId(
        l2ChainId,
        L1Erc20Token,
        L2Erc20Token,
        depositAmount,
        l2Gas,
        "0x",
        {
          value: parseEther("0.0025"),
        }
      );

      await depositTokensTxResponse.wait();
    });

    it("Receipt with a status of 1 for a successful message", async function () {
      const { remoteReceipt } = await waitForXDomainTransaction(
        context.watcher,
        depositTokensTxResponse,
        Direction.L1ToL2
      );
      assert.equal(remoteReceipt.status, 1);
    });

    it("Check balances", async function () {
      const {
        l1Tester,
        contracts: { l1Token, l2Token },
        depositAmount,
        initL1TokenBalance,
        initL2TokenBalance,
      } = context;
      const l1Balance = await l1Token.balanceOf(l1Tester.address);
      const l2Balance = await l2Token.balanceOf(l1Tester.address);
      expect(l1Balance).to.be.eq(initL1TokenBalance);
      expect(l2Balance).to.be.eq(initL2TokenBalance + depositAmount);
    });
  });
});
