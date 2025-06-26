const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying MockUSDC with:", deployer.address);

  const USDC = await hre.ethers.getContractFactory("MockUSDC");

  const usdc = await USDC.deploy();
  await usdc.deployed();

  console.log("MockUSDC deployed at:", usdc.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});