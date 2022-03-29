import { ethers } from "ethers";
import * as Uniswap from './src/uniswap.js';
import * as Utils from './src/utils.js'

/* ------------ user settings ------------ */
const sourceAsset = 'DAI';
const destinationAsset= 'WETH';
const amountToSwap = 1;
const useEdgeContract = true;
const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";
/* ------------ user settings ------------ */

const walletNonce = await Utils.getNonceForWallet(walletAddress);
const sourceTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(sourceAsset);
const destinationTokenAddress = Utils.getRinkebyAddressFromCurrencyCode(destinationAsset);

const swapRequest = {
  fromWallet: { address: walletAddress, nonce: walletNonce },
  fromCurrencyCode: sourceTokenAddress,
  // toCurrencyCode: "0x58c2E9C13AC84DFD5a4c522DC55ab5e1829319D6", // scam token that can be used to test for no liquidity
  toCurrencyCode: destinationTokenAddress,
  nativeAmount:  ethers.utils.parseEther(amountToSwap.toString()),
}

Uniswap.fetchSwapQuote(swapRequest)
    .then((quote) => {
      console.log(amountToSwap + " " + sourceAsset + " = " + (quote*amountToSwap) + " " + destinationAsset);
      console.log("1 " + destinationAsset + " = " + 1/quote + " " + sourceAsset);
    }).catch(console.error);
