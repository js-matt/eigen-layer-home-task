import { ethers } from "hardhat";
import { expect } from "chai";

describe("OTC_Swap", function () {
    let OTC_Swap;
    let otcSwap: any;
    let tokenX: any;
    let tokenY: any;
    let owner: any;
    let alice: any;
    let bob: any;

    beforeEach(async function () {
        [owner, alice, bob, _] = await ethers.getSigners();
        OTC_Swap = await ethers.getContractFactory("OTC_Swap");
        otcSwap = await OTC_Swap.deploy();
        await otcSwap.deployed();

        const Token = await ethers.getContractFactory("ERC20Mock");
        tokenX = await Token.deploy("TokenX", "TX", alice.address, ethers.utils.parseEther("1000"));
        tokenY = await Token.deploy("TokenY", "TY", bob.address, ethers.utils.parseEther("1000"));
        await tokenX.deployed();
        await tokenY.deployed();
    });

    describe("Create Swap", function () {
        it("Should create a swap", async function () {
            await tokenX.connect(alice).approve(otcSwap.address, ethers.utils.parseEther("100"));
            const expiration = (await ethers.provider.getBlock('latest')).timestamp + 3600; // 1 hour from now
            await expect(otcSwap.connect(alice).createSwap(tokenX.address, tokenY.address, bob.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("50"), expiration))
                .to.emit(otcSwap, 'SwapCreated');

            const swap = await otcSwap.swaps(1);
            expect(swap.amountX).to.equal(ethers.utils.parseEther("100"));
            expect(swap.amountY).to.equal(ethers.utils.parseEther("50"));
            expect(swap.expiration).to.equal(expiration);
            expect(swap.completed).to.be.false;
        });

        it("Should not create a swap with past expiration", async function () {
            const pastExpiration = (await ethers.provider.getBlock('latest')).timestamp - 3600; // 1 hour in the past
            await expect(otcSwap.connect(alice).createSwap(tokenX.address, tokenY.address, bob.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("50"), pastExpiration))
                .to.be.revertedWith("Expiration time should be in the future");
        });
    });

    describe("Execute Swap", function () {
        beforeEach(async function () {
            await tokenX.connect(alice).approve(otcSwap.address, ethers.utils.parseEther("100"));
            const expiration = (await ethers.provider.getBlock('latest')).timestamp + 3600; // 1 hour from now
            await otcSwap.connect(alice).createSwap(tokenX.address, tokenY.address, bob.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("50"), expiration);
            await tokenY.connect(bob).approve(otcSwap.address, ethers.utils.parseEther("50"));
        });

        it("Should execute the swap", async function () {
            await expect(otcSwap.connect(bob).executeSwap(1)).to.emit(otcSwap, 'SwapCompleted');
            const swap = await otcSwap.swaps(1);
            expect(swap.completed).to.be.true;
        });

        it("Should not execute the swap by unauthorized user", async function () {
            await expect(otcSwap.connect(alice).executeSwap(1)).to.be.revertedWith("Only designated counterparty can execute the swap");
        });

        it("Should not execute an expired swap", async function () {
            const expiration = (await ethers.provider.getBlock('latest')).timestamp - 3600; // 1 hour in the past
            await otcSwap.connect(alice).createSwap(tokenX.address, tokenY.address, bob.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("50"), expiration);
            await tokenY.connect(bob).approve(otcSwap.address, ethers.utils.parseEther("50"));
            await expect(otcSwap.connect(bob).executeSwap(2)).to.be.revertedWith("Swap has expired");
        });

        it("Should not execute a completed swap", async function () {
            await otcSwap.connect(bob).executeSwap(1);
            await expect(otcSwap.connect(bob).executeSwap(1)).to.be.revertedWith("Swap already completed");
        });
    });
});
