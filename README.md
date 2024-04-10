# metes-testing

This repository is for testing Metis Sepolia after the usage of a decentralized sequencer. 

## Setup

First install the needed packages:
```
npm install
```

Then copy and fill the env files:

```
cp .env.example .env
```

Add private keys `PRIVATE_KEYS` separated with a comma. Add at least two private keys, they can NOT be the same. Add providers for Metis Sepolia and Ethereum Sepolia. Both accounts should have Ether and Metis on L1 (Ethereum Sepolia) and on L2 (Metis Sepolia).

Optional env vars for RPC header authentication are provided: `MTS_SEPOLIA_RPC_URL_HEADERS`, `ETH_SEPOLIA_RPC_URL_HEADERS`.

Compile the smart contracts with the following:
```
npm run compile
```

## Tests
There are categories of tests. Below are the different types of tests. To run all tests, you can run:
```
npm run test
```

1. Cross-Chain Bridge Tests Cases `test/crossChainBridging`:
- Deposit: Verify deposits from L1 to L2 are successfully and correctly reflected. 
- Withdraw: Ensure withdrawals from L2 to L1 are executed and settled correctly (to be added).
- Multiple Withdrawal Transactions: Test the inclusion of multiple withdrawal transactions within a single block (to be added).

You can run the tests in this category with: 

```
npm run test:cross-chain-bridge
```

2. Transaction Types Tests Cases `test/simpleContracts`:
- Gas Amount: Evaluate multiple transactions with varying gas (to be added).
- Data Size: Test transactions with different data payload sizes to measure performance and cost (to be added).
- METIS Transfers: Confirm successful METIS transfers between accounts.
- ERC20 Transfers: Verify ERC20 token transfers, including contract interaction and token balance updates.
- ERC721 Transfers: Test the transfer of ERC721 tokens, ensuring correct ownership change and contract interaction.

You can run the tests in this category with: 

```
npm run test:simple-contracts
```

3. Smart Contract Tests Cases (to be added):
- Contract Deployment: Deploy contracts of varying sizes to assess the impact on gas and performance.
- Complex Contracts: Execute complex contract interactions such as DEX swap transactions，Automated market maker (AMM) liquidity provision and withdrawal, flash loans,Yield farming protocols interaction.
- Other contracts need for testing.

4. DApp Test Cases Cases (to be added):
- Smart Contract Integration: Verify DApp’s smart contracts interact correctly after Txpool upgrade, including accurate transaction processing and event handling.
- Scalability Testing: Assess the DApp's performance after Txpool upgrade.


## Known issues:
1. ❌ When a transaction should revert with a custom error, the error name is not shown, instead we get missing revert data. 
2. ⏳ The explorer transaction count and possibly other details don't get updated and get stuck for some time. 