# 🦄🦄🦄
This code uses Node.js to generate transactions to run DEX swaps using:
1. The Uniswap V2 Router contract
2. A custom Edge smart contract that subtracts a nominal fee

```
git clone https://github.com/joonspoon/edge-swap-txs
cd edge-swap-txs
npm install
```

## Requirements:
* Node.js
* Some ETH for testing that you can get from the Chainlink faucet [https://faucets.chain.link/rinkeby]
* A provider key for interacting with the Ethereum blockchain such as Alchemy [https://www.alchemy.com/]
* Create a file "secrets.json" in the source directory containing the wallet private key and alchemy key
* Edit the wallet address in testSwap.js

## To run swaps:
```
yarn test
```
