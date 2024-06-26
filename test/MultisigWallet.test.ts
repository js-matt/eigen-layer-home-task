import { ethers } from "hardhat";
import { expect } from "chai";

describe("MultisigWallet", function () {
    let MultisigWallet;
    let multisigWallet: any;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let addr3: any;
    let addr4: any;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, addr4, _] = await ethers.getSigners();
        MultisigWallet = await ethers.getContractFactory("MultisigWallet");
        multisigWallet = await MultisigWallet.deploy([owner.address, addr1.address, addr2.address], 2);
        await multisigWallet.deployed();
    });

    describe("Submit Transaction", function () {
        it("Should submit a transaction", async function () {
            await expect(multisigWallet.connect(owner).submitTransaction(addr3.address, ethers.utils.parseEther("1"), "0x"))
                .to.emit(multisigWallet, 'TransactionCreated');

            const transaction = await multisigWallet.transactions(1);
            expect(transaction.destination).to.equal(addr3.address);
            expect(transaction.value).to.equal(ethers.utils.parseEther("1"));
            expect(transaction.executed).to.be.false;
        });

        it("Should not submit a transaction by non-signatory", async function () {
            await expect(multisigWallet.connect(addr4).submitTransaction(addr3.address, ethers.utils.parseEther("1"), "0x"))
                .to.be.revertedWith("Not a signatory");
        });
    });

    describe("Confirm Transaction", function () {
        beforeEach(async function () {
            await multisigWallet.connect(owner).submitTransaction(addr3.address, ethers.utils.parseEther("1"), "0x");
        });

        it("Should confirm a transaction", async function () {
            await expect(multisigWallet.connect(addr1).confirmTransaction(1)).to.emit(multisigWallet, 'TransactionConfirmed');

            const transaction = await multisigWallet.transactions(1);
            expect(transaction.confirmations).to.equal(2); // 1 from submitter and 1 from addr1
        });

        it("Should not confirm a transaction by non-signatory", async function () {
            await expect(multisigWallet.connect(addr4).confirmTransaction(1)).to.be.revertedWith("Not a signatory");
        });

        it("Should not confirm a transaction twice", async function () {
            await multisigWallet.connect(addr1).confirmTransaction(1);
            await expect(multisigWallet.connect(addr1).confirmTransaction(1)).to.be.revertedWith("Transaction already confirmed");
        });
    });

    describe("Execute Transaction", function () {
        beforeEach(async function () {
            await multisigWallet.connect(owner).submitTransaction(addr3.address, ethers.utils.parseEther("1"), "0x");
        });

        it("Should execute a transaction", async function () {
            await multisigWallet.connect(addr1).confirmTransaction(1);
            await expect(multisigWallet.connect(owner).executeTransaction(1)).to.emit(multisigWallet, 'TransactionExecuted');

            const transaction = await multisigWallet.transactions(1);
            expect(transaction.executed).to.be.true;
        });

        it("Should not execute a transaction without enough confirmations", async function () {
            await expect(multisigWallet.connect(owner).executeTransaction(1)).to.be.revertedWith("Not enough confirmations");
        });

        it("Should not execute a transaction twice", async function () {
            await multisigWallet.connect(addr1).confirmTransaction(1);
            await multisigWallet.connect(owner).executeTransaction(1);
            await expect(multisigWallet.connect(owner).executeTransaction(1)).to.be.revertedWith("Transaction already executed");
        });
    });
});
