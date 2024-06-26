# Eigen layer Home Task
This repository contains three Solidity smart contracts along with their corresponding test cases. The contracts are designed to demonstrate different functionalities: an OTC Swap contract, a Multisignature Wallet contract, and a Decentralized Marketplace contract.

## OTC Swap
### Overview
The OTC Swap contract allows two parties, Alice and Bob, to swap specified amounts of two different ERC20 tokens in a single atomic transaction. The swap is only executable by the designated counterparty within a specified timeframe.
### Smart Contract Code
The OTC Swap smart contract is implemented in `contracts/OTC_Swap.sol`.
### Test Cases

The test cases for the OTC Swap contract are implemented in `test/OTC_Swap.test.ts` and cover the following scenarios:

- Creating a swap with valid and invalid inputs.
- Executing a swap by the authorized user.
- Preventing unauthorized users from executing the swap.
- Handling swap expiration and preventing double execution.

## Multisignature Wallet
### Overview
The Multisignature Wallet contract requires a certain number of signatures (m-of-n) for any transaction to be executed. The threshold (m) and list of signatories are adjustable through multisig actions. The wallet supports queuing multiple actions as part of a single transaction.

### Smart Contract Code
The Multisignature Wallet smart contract is implemented in `contracts/MultisigWallet.sol`.
### Test Cases

The test cases for the Multisignature Wallet contract are implemented in `test/MultisigWallet.test.ts` and cover the following scenarios:

- Submitting transactions by signatories.
- Confirming transactions and preventing multiple confirmations by the same signatory.
- Executing transactions with enough confirmations.
- Preventing execution without sufficient confirmations or double execution.

## Decentralized Marketplace
### Overview
The Decentralized Marketplace contract simulates a marketplace where users can list, buy, and sell items. Key functionalities include user registration, item listing, item purchasing, and item retrieval.

### Smart Contract Code
The Decentralized Marketplace smart contract is implemented in `contracts/Marketplace.sol`.
### Test Cases

The test cases for the Decentralized Marketplace contract are implemented in `test/Marketplace.test.ts` and cover the following scenarios:

- User registration and preventing duplicate registrations.
- Listing items for sale by registered users.
- Purchasing items and handling incorrect values.
- Retrieving item details and handling non-existent items.

## Getting Started
### Prerequisites

To run the smart contracts and tests, you need to have the following tools installed:

- Node.js
- npm
- Hardhat

