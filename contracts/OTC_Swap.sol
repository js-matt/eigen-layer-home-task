// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract OTC_Swap {
    struct Swap {
        address tokenX;
        address tokenY;
        address alice;
        address bob;
        uint256 amountX;
        uint256 amountY;
        uint256 expiration;
        bool completed;
    }

    mapping(uint256 => Swap) public swaps;
    uint256 public swapCounter;

    event SwapCreated(uint256 indexed swapId, address indexed alice, address indexed bob, uint256 amountX, uint256 amountY, uint256 expiration);
    event SwapCompleted(uint256 indexed swapId);

    function createSwap(
        address tokenX,
        address tokenY,
        address bob,
        uint256 amountX,
        uint256 amountY,
        uint256 expiration
    ) external returns (uint256) {
        require(expiration > block.timestamp, "Expiration time should be in the future");

        swapCounter++;
        swaps[swapCounter] = Swap({
            tokenX: tokenX,
            tokenY: tokenY,
            alice: msg.sender,
            bob: bob,
            amountX: amountX,
            amountY: amountY,
            expiration: expiration,
            completed: false
        });

        emit SwapCreated(swapCounter, msg.sender, bob, amountX, amountY, expiration);
        return swapCounter;
    }

    function executeSwap(uint256 swapId) external {
        Swap storage swap = swaps[swapId];
        require(swap.completed == false, "Swap already completed");
        require(swap.expiration >= block.timestamp, "Swap has expired");
        require(msg.sender == swap.bob, "Only designated counterparty can execute the swap");

        IERC20(swap.tokenX).transferFrom(swap.alice, swap.bob, swap.amountX);
        IERC20(swap.tokenY).transferFrom(swap.bob, swap.alice, swap.amountY);

        swap.completed = true;
        emit SwapCompleted(swapId);
    }
}
