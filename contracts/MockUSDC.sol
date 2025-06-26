// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;
    uint256 private constant _INITIAL_SUPPLY = 1_000_000 * 10**_DECIMALS;

    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {
        _mint(msg.sender, _INITIAL_SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}