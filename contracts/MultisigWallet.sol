// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultisigWallet {
    address[] public signatories;
    uint256 public requiredSignatures;
    mapping(address => bool) public isSignatory;
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    mapping(uint256 => mapping(address => bool)) public confirmations;

    event TransactionCreated(uint256 indexed transactionId, address indexed creator);
    event TransactionConfirmed(uint256 indexed transactionId, address indexed signatory);
    event TransactionExecuted(uint256 indexed transactionId);

    modifier onlySignatory() {
        require(isSignatory[msg.sender], "Not a signatory");
        _;
    }

    constructor(address[] memory _signatories, uint256 _requiredSignatures) {
        require(_signatories.length >= _requiredSignatures, "Not enough signatories");

        for (uint256 i = 0; i < _signatories.length; i++) {
            isSignatory[_signatories[i]] = true;
        }
        signatories = _signatories;
        requiredSignatures = _requiredSignatures;
    }

    function submitTransaction(address destination, uint256 value, bytes memory data) public onlySignatory returns (uint256) {
        transactionCount++;
        transactions[transactionCount] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        });
        emit TransactionCreated(transactionCount, msg.sender);
        confirmTransaction(transactionCount);
        return transactionCount;
    }

    function confirmTransaction(uint256 transactionId) public onlySignatory {
        Transaction storage txn = transactions[transactionId];
        require(txn.executed == false, "Transaction already executed");
        require(confirmations[transactionId][msg.sender] == false, "Transaction already confirmed");

        confirmations[transactionId][msg.sender] = true;
        txn.confirmations++;
        emit TransactionConfirmed(transactionId, msg.sender);

        if (txn.confirmations >= requiredSignatures) {
            executeTransaction(transactionId);
        }
    }

    function executeTransaction(uint256 transactionId) public onlySignatory {
        Transaction storage txn = transactions[transactionId];
        require(txn.executed == false, "Transaction already executed");
        require(txn.confirmations >= requiredSignatures, "Not enough confirmations");

        txn.executed = true;
        (bool success,) = txn.destination.call{value: txn.value}(txn.data);
        require(success, "Transaction failed");
        emit TransactionExecuted(transactionId);
    }
}
