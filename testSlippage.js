import { ethers } from "ethers";
import * as Uniswap from './src/uniswap.js';
import * as Utils from './src/utils.js'

/* ------------ user settings ------------ */
const sourceAsset = 'WETH';
const destinationAsset= 'DAI';
const amountToSwap = .001;
const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";
const slippageTolerance = 3;  // percent
/* ------------ user settings ------------ */

const walletNonce = await Utils.getNonceForWallet(walletAddress);
const sourceTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(sourceAsset);
const destinationTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(destinationAsset);

const swapRequest = {
  fromWallet: { address: walletAddress, nonce: walletNonce },
  fromCurrencyCode: sourceTokenAddress,
  toCurrencyCode: destinationTokenAddress,
  nativeAmount:  ethers.utils.parseEther(amountToSwap.toString()),
}

await Uniswap.fetchSwapQuote(swapRequest)
    .then((quote) => {
      console.log(amountToSwap + " " + sourceAsset + " = " + (quote*amountToSwap) + " " + destinationAsset);
      console.log("1 " + destinationAsset + " = " + 1/quote + " " + sourceAsset);
      let tokensExpectedOut = quote * amountToSwap;
      let tokensRoundedDown = Math.floor(tokensExpected - (tokensExpected*slippageTolerance/100));
      //  tokensRoundedDown += 100; // to test out a slippage failure
      swapRequest.minimumOut = ethers.utils.parseEther(tokensRoundedDown.toString());
    }).catch(console.error);

let transactions = await Uniswap.generateSwapTransactionsForEdgeContract(swapRequest);

    for (const transaction of transactions) {
      const result = await Utils.signAndSendTransaction(transaction);
      const { transactionHash } = result;
      const transactionURL = "https://dashboard.tenderly.co/tx/rinkeby/" + transactionHash;
      console.log("Transaction is pending at " + transactionURL);
    }
