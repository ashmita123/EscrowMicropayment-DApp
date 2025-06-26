// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowMicroPay is Ownable {

    IERC20 public immutable stable;
    bytes32 public immutable serviceId;

    address public serviceOwner;

    mapping(address => uint256) public balanceOf;

    event Deposited(address indexed user, uint256 amount, bytes32 indexed serviceId);
    event Released(address indexed user, uint256 amount, address indexed to, bytes32 indexed serviceId);

    constructor(
        address initialOwner,
        address _token,
        bytes32 _serviceId,
        address _serviceOwner
    )
        Ownable(initialOwner)
    {
        require(_token != address(0), "Escrow: bad token address");
        require(_serviceOwner != address(0), "Escrow: bad serviceOwner");

        stable       = IERC20(_token);
        serviceId    = _serviceId;
        serviceOwner = _serviceOwner;
    }

    modifier onlyService() {
        require(msg.sender == serviceOwner, "Escrow: caller not serviceOwner");
        _;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Escrow: deposit=0");

        balanceOf[msg.sender] += amount;

        bool success = stable.transferFrom(msg.sender, address(this), amount);
        require(success, "Escrow: transferFrom fail");

        emit Deposited(msg.sender, amount, serviceId);
    }

    function release(address user, uint256 amount) external onlyService {
        require(amount > 0, "Escrow: release=0");
        require(balanceOf[user] >= amount, "Escrow: insufficient balance");

        balanceOf[user] -= amount;

        bool success = stable.transfer(serviceOwner, amount);
        require(success, "Escrow: stable transfer fail");

        emit Released(user, amount, serviceOwner, serviceId);
    }

    function setServiceOwner(address newServiceOwner) external onlyOwner {
        require(newServiceOwner != address(0), "Escrow: zero serviceOwner");
        serviceOwner = newServiceOwner;
    }

    function rescueTokens(address to) external onlyOwner {
        require(to != address(0), "Escrow: rescue to zero");
        uint256 bal = stable.balanceOf(address(this));
        bool success = stable.transfer(to, bal);
        require(success, "Escrow: rescue transfer fail");
    }
}