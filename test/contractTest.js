const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowMicroPay", function () {
  let stableToken;
  let escrow;
  let owner;
  let user;
  let serviceOwner;

  const DECIMALS = 6;
  const toUnits = (amount) => ethers.utils.parseUnits(amount.toString(), DECIMALS);

  beforeEach(async () => {
    [owner, user, serviceOwner, other] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    stableToken = await MockUSDC.deploy();
    await stableToken.deployed();

    // Transfer 100 tokens to user
    await stableToken.transfer(user.address, toUnits(100));

    const EscrowMicroPay = await ethers.getContractFactory("EscrowMicroPay");
    escrow = await EscrowMicroPay.deploy(
      owner.address,
      stableToken.address,
      ethers.utils.formatBytes32String("Service1"),
      serviceOwner.address
    );
    await escrow.deployed();
  });

  it("should allow user to deposit tokens", async () => {
    const depositAmount = toUnits(10);

    await stableToken.connect(user).approve(escrow.address, depositAmount);
    await expect(escrow.connect(user).deposit(depositAmount))
      .to.emit(escrow, "Deposited")
      .withArgs(user.address, depositAmount, await escrow.serviceId());

    expect(await escrow.balanceOf(user.address)).to.equal(depositAmount);
    expect(await stableToken.balanceOf(escrow.address)).to.equal(depositAmount);
  });

  it("should allow service owner to release tokens", async () => {
    const depositAmount = toUnits(10);

    await stableToken.connect(user).approve(escrow.address, depositAmount);
    await escrow.connect(user).deposit(depositAmount);

    await expect(escrow.connect(serviceOwner).release(user.address, depositAmount))
      .to.emit(escrow, "Released")
      .withArgs(user.address, depositAmount, serviceOwner.address, await escrow.serviceId());

    expect(await escrow.balanceOf(user.address)).to.equal(0);
    expect(await stableToken.balanceOf(serviceOwner.address)).to.equal(depositAmount);
  });

  it("should fail if non-service owner tries to release", async () => {
    await expect(
      escrow.connect(user).release(user.address, toUnits(1))
    ).to.be.revertedWith("Escrow: caller not serviceOwner");
  });

  it("should allow contract owner to set a new service owner", async () => {
    await escrow.connect(owner).setServiceOwner(user.address);
    expect(await escrow.serviceOwner()).to.equal(user.address);
  });

  it("should allow contract owner to rescue tokens", async () => {
    const depositAmount = toUnits(10);

    // Approve and deposit from user
    await stableToken.connect(user).approve(escrow.address, depositAmount);
    await escrow.connect(user).deposit(depositAmount);

    // Get owner balance before rescue
    const balanceBefore = await stableToken.balanceOf(owner.address);

    // Rescue tokens
    await escrow.connect(owner).rescueTokens(owner.address);

    // Get owner balance after
    const balanceAfter = await stableToken.balanceOf(owner.address);

    // Check delta
    const delta = balanceAfter.sub(balanceBefore);
    expect(delta).to.equal(depositAmount);
  });
});