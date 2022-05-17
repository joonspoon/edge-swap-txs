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
* Some ETH for testing that you can get from the Chainlink faucet [https://faucets.chain.link/goerli]
* A provider key for interacting with the Ethereum blockchain such as Alchemy [https://www.alchemy.com/]
* Create a file "secrets.json" in the source directory containing the wallet private key and alchemy key
* Edit the wallet address in testSwap.js

## To run swaps:
Before running the command below:
* Use the testSwap.js file to select a pair and an amount to swap.
* Make sure your Goerli wallet has enough of your source asset. See above for obtaining test ETH and LINK from a faucet.

[notes] Not all tokens have liquidity on Goerli. Good options for swaps are UNI, LINK, DAI, and WETH.
Stable coin liquidity (USDC & USDT) is shallow on Goerli, so you swapping between these is unlikely to result in the 1:1 ratio you might expect.
```
yarn swap
```

## To withdraw fees:
The smart contract will collect 0.5% from each swap and hold it until this withdraw command shakes the money tree. The withdrawal address is fixed to the contract owner which is [0xeBf5C62481B5F65E5994317cE7EB71AafE82E8bb](https://goerli.etherscan.io/address/0xeBf5C62481B5F65E5994317cE7EB71AafE82E8bb). You can use this link to check that the funds have been received.
```
yarn cashout
```

## To check liquidity and get a swap quote:
```
yarn liquid
```
