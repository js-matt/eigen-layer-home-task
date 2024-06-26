// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Item {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address payable owner;
        bool isSold;
    }

    struct User {
        string username;
        bool isRegistered;
    }

    uint256 public itemCounter;
    mapping(uint256 => Item) public items;
    mapping(address => User) public users;

    event UserRegistered(address indexed user, string username);
    event ItemListed(uint256 indexed itemId, address indexed owner, uint256 price);
    event ItemPurchased(uint256 indexed itemId, address indexed buyer);

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User is not registered");
        _;
    }

    function registerUser(string memory username) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User(username, true);
        emit UserRegistered(msg.sender, username);
    }

    function listItem(string memory name, string memory description, uint256 price) public onlyRegisteredUser {
        require(price > 0, "Price must be greater than zero");

        itemCounter++;
        items[itemCounter] = Item(itemCounter, name, description, price, payable(msg.sender), false);

        emit ItemListed(itemCounter, msg.sender, price);
    }

    function purchaseItem(uint256 itemId) public payable onlyRegisteredUser {
        Item storage item = items[itemId];
        require(item.id > 0, "Item does not exist");
        require(!item.isSold, "Item is already sold");
        require(msg.value == item.price, "Incorrect value sent");

        item.owner.transfer(msg.value);
        item.owner = payable(msg.sender);
        item.isSold = true;

        emit ItemPurchased(itemId, msg.sender);
    }

    function getItemDetails(uint256 itemId) public view returns (Item memory) {
        require(items[itemId].id > 0, "Item does not exist");
        return items[itemId];
    }
}
