import { ethers } from "ethers";
import * as Uniswap from './src/uniswap.js';
import * as Utils from './src/utils.js'

/* ------------ user settings ------------ */
const sourceAsset = 'ETH'; // start with ETH unless you already have some ERC-20 tokens in wallet
const destinationAsset= 'UNI';  // some ERC-20 tokens that have liquidity on Rinkeby are: LINK, DAI, UNI, MKR
const amountToSwap = ethers.utils.parseEther(".0001");
const useEdgeContract = true; //we can also use the Uniswap router directly
const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";
/* ------------ user settings ------------ */

const walletNonce = await Utils.getNonceForWallet(walletAddress);
const sourceTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(sourceAsset);
const destinationTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(destinationAsset);

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
  //const transactionURL = "https://rinkeby.etherscan.io/tx/" + transactionHash;
  const transactionURL = "https://dashboard.tenderly.co/tx/rinkeby/" + transactionHash;
  console.log("Transaction is pending at " + transactionURL);
}
