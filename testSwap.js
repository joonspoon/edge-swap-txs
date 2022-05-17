import { ethers } from "ethers";
import * as Uniswap from './src/uniswap.js';
import * as Utils from './src/utils.js'

/* ------------ user settings ------------ */
const sourceAsset = 'ETH';  // start with ETH unless
const destinationAsset= 'UNI'; // some tokens that have liquidity on Goerli are: DAI    LINK, DAI, UNI
const amountToSwap = ethers.utils.parseEther("0.0000001");
const useEdgeContract = true; //we can also use the Uniswap route directly
const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";
/* ------------ user settings ------------ */

const walletNonce = await Utils.getNonceForWallet(walletAddress);
const sourceTokenAddress = Utils.getGoerliAddressFromCurrencyCode(sourceAsset);
const destinationTokenAddress = Utils.getGoerliAddressFromCurrencyCode(destinationAsset);

const swapRequest = {
  fromWallet: { address: walletAddress, nonce: walletNonce },
  fromCurrencyCode: sourceTokenAddress, //TODO change from fromCurrencyCode to sourceTokenAddress
  toCurrencyCode: destinationTokenAddress,
  nativeAmount: amountToSwap,
}

let transactions = [];
if (useEdgeContract)
   transactions = await Uniswap.generateSwapTransactionsForEdgeContract(swapRequest);
else
   transactions = await Uniswap.generateSwapTransactionsForUniswapRouter(swapRequest);

for (const transaction of transactions) {
  const result = await Utils.signAndSendTransaction(transaction);
  const { transactionHash } = result;
  //const transactionURL = "https://goerli.etherscan.io/tx/" + transactionHash;
  const transactionURL = "https://dashboard.tenderly.co/tx/goerli/" + transactionHash;
  console.log("Transaction is pending at " + transactionURL);
}
