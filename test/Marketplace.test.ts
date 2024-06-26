import { ethers } from "hardhat";
import { expect } from "chai";

describe("Marketplace", function () {
    let Marketplace;
    let marketplace: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2, _] = await ethers.getSigners();
        Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await Marketplace.deploy();
        await marketplace.deployed();
    });

    describe("User Registration", function () {
        it("Should register a user", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            const user = await marketplace.users(addr1.address);
            expect(user.isRegistered).to.be.true;
            expect(user.username).to.equal("user1");
        });

        it("Should not allow duplicate registration", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await expect(marketplace.connect(addr1).registerUser("user1"))
                .to.be.revertedWith("User already registered");
        });
    });

    describe("List Item", function () {
        it("Should list an item for sale", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await marketplace.connect(addr1).listItem("Item1", "Description1", ethers.utils.parseEther("1"));
            const item = await marketplace.items(1);
            expect(item.id).to.equal(1);
            expect(item.name).to.equal("Item1");
            expect(item.description).to.equal("Description1");
            expect(item.price).to.equal(ethers.utils.parseEther("1"));
            expect(item.owner).to.equal(addr1.address);
            expect(item.isSold).to.be.false;
        });

        it("Should not list an item if not registered", async function () {
            await expect(marketplace.connect(addr1).listItem("Item1", "Description1", ethers.utils.parseEther("1")))
                .to.be.revertedWith("User is not registered");
        });

        it("Should not list an item with zero price", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await expect(marketplace.connect(addr1).listItem("Item1", "Description1", 0))
                .to.be.revertedWith("Price must be greater than zero");
        });
    });

    describe("Purchase Item", function () {
        it("Should purchase an item", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await marketplace.connect(addr2).registerUser("user2");
            await marketplace.connect(addr1).listItem("Item1", "Description1", ethers.utils.parseEther("1"));

            await marketplace.connect(addr2).purchaseItem(1, { value: ethers.utils.parseEther("1") });
            const item = await marketplace.items(1);
            expect(item.isSold).to.be.true;
            expect(item.owner).to.equal(addr2.address);
        });

        it("Should not purchase an item with incorrect value", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await marketplace.connect(addr2).registerUser("user2");
            await marketplace.connect(addr1).listItem("Item1", "Description1", ethers.utils.parseEther("1"));

            await expect(marketplace.connect(addr2).purchaseItem(1, { value: ethers.utils.parseEther("0.5") }))
                .to.be.revertedWith("Incorrect value sent");
        });

        it("Should not purchase a non-existent item", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await marketplace.connect(addr2).registerUser("user2");

            await expect(marketplace.connect(addr2).purchaseItem(1, { value: ethers.utils.parseEther("1") }))
                .to.be.revertedWith("Item does not exist");
        });

        it("Should not purchase an already sold item", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await marketplace.connect(addr2).registerUser("user2");
            await marketplace.connect(addr1).listItem("Item1", "Description1", ethers.utils.parseEther("1"));

            await marketplace.connect(addr2).purchaseItem(1, { value: ethers.utils.parseEther("1") });

            await expect(marketplace.connect(addr2).purchaseItem(1, { value: ethers.utils.parseEther("1") }))
                .to.be.revertedWith("Item is already sold");
        });
    });

    describe("Retrieve Item Details", function () {
        it("Should retrieve item details", async function () {
            await marketplace.connect(addr1).registerUser("user1");
            await marketplace.connect(addr1).listItem("Item1", "Description1", ethers.utils.parseEther("1"));

            const item = await marketplace.getItemDetails(1);
            expect(item.id).to.equal(1);
            expect(item.name).to.equal("Item1");
            expect(item.description).to.equal("Description1");
            expect(item.price).to.equal(ethers.utils.parseEther("1"));
            expect(item.owner).to.equal(addr1.address);
            expect(item.isSold).to.be.false;
        });

        it("Should not retrieve details of a non-existent item", async function () {
            await expect(marketplace.getItemDetails(1)).to.be.revertedWith("Item does not exist");
        });
    });
});
