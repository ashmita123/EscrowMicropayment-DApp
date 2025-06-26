const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const tokenAddr = process.env.USDC_TESTNET;
  if (!tokenAddr) throw new Error("USDC_TESTNET not set");

  const aggregatorId = hre.ethers.utils.id("DUFFEL");
  const aggregatorWal = process.env.SERVICE_OWNER;

  if (!aggregatorWal) throw new Error("SERVICE_OWNER not set");

  const initialOwner = deployer.address;

  const Escrow = await hre.ethers.getContractFactory("EscrowMicroPay");
  const escrow = await Escrow.deploy(
    initialOwner,
    tokenAddr,
    aggregatorId,
    aggregatorWal
  );
  await escrow.deployed();

  console.log("EscrowMicroPay deployed at:", escrow.address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});