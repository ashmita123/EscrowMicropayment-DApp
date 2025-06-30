# Escrow Micro-Pay Smart Contract (Ethereum + Hardhat)

This project implements a lightweight escrow smart contract on Ethereum. It enables users to deposit ERC-20 stablecoins and allows a designated service to release tokens under defined conditions. A mock USDC token is included for local testing.

## Setup

### Install Dependencies

```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```
## Deploy Contracts

### Deploy MockUSDC Token
```bash
node scripts/deploy_mock_usdc.js
```
### Deploy EscrowMicroPay

Update .env with:
```bash
USDC_TESTNET=0xDeployedMockUSDCAddress
SERVICE_OWNER=0xWalletAddress
```
Then deploy:
```bash
node scripts/deploy.js
```
### Run Tests
```bash
npx hardhat test
```

### Author

•	Ashmita Pandey
•	GitHub: https://github.com/ashmita123
•	LinkedIn: https://linkedin.com/in/ashmitapandey

### License

MIT License

