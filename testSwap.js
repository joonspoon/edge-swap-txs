import { ethers } from "ethers";
import * as Uniswap from './src/uniswap.js';
import * as Utils from './src/utils.js'

/* ------------ user settings ------------ */
const sourceAsset = 'LINK';
const destinationAsset= 'WETH';
const amountToSwap = ethers.utils.parseEther(".001");
const useEdgeContract = true;
const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";
/* ------------ user settings ------------ */

const walletNonce = await Utils.getNonceForWallet(walletAddress);
const sourceTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(sourceAsset);
const destinationTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(destinationAsset);

const swapRequest = {
  fromWallet: { address: walletAddress, nonce: walletNonce },
  fromCurrencyCode: sourceTokenAddress,
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
  const transactionURL = "https://rinkeby.etherscan.io/tx/" + transactionHash;
  console.log("Transaction is pending at " + transactionURL);
}
