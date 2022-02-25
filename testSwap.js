import { ethers } from "ethers";
import * as Uniswap from './src/uniswap.js';
import * as Utils from './src/utils.js'
import Web3 from "web3";

const sourceAsset = 'WETH';
const destinationAsset= 'UNI';
const amountToSwap = ethers.utils.parseEther(".001");
const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";

const sourceTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(sourceAsset);
const destinationTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(destinationAsset);

const transactions = await Uniswap.generateSwapTransactions(sourceTokenAddress, destinationTokenAddress, amountToSwap, walletAddress);

for (const transaction of transactions) {
  const result = await Utils.signAndSendTransaction(transaction);
  const { transactionHash } = result;
  const transactionURL = "https://rinkeby.etherscan.io/tx/" + transactionHash;
  console.log("Transaction is pending at " + transactionURL);
}
