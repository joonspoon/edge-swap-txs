import * as Utils from './utils.js';
import Web3 from "web3";
import { Transaction } from 'ethereumjs-tx';

export async function generateSwapTransactions(sourceTokenAddress, destinationTokenAddress, amount, senderAddress) {
  // TODO: await generateApprovalIfNecessary()
  const swapTx = await generateSwapTransaction (sourceTokenAddress, destinationTokenAddress, amount, senderAddress);
  return [swapTx];
}

export async function generateSwapTransaction (sourceTokenAddress, destinationTokenAddress, amount, senderAddress) {
  const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const uniswapRouterInterface = Utils.loadContractAbi("uniswap-router");

  const web3 = new Web3(Utils.getFakeProvider());
  const swapContract = new web3.eth.Contract(uniswapRouterInterface, uniswapRouterAddress);

  /* swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) */
  const path = [sourceTokenAddress, destinationTokenAddress];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
  const swapContractFilled = swapContract.methods.swapExactETHForTokens(0, path, senderAddress, deadline).encodeABI();
  // const nonce = await web3.eth.getTransactionCount(senderAddress);

  const swapTransaction = {
      chainId: 4, //rinkeby
      nonce: web3.utils.toHex(107), // <--- manually filling nonce
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: web3.utils.toHex(amount),
      to: uniswapRouterAddress,
      from: senderAddress,
      data: swapContractFilled
  };

  return new Transaction(swapTransaction, { chain: 'rinkeby' })
}
