import * as Utils from './utils.js';
import Web3 from "web3";
import { Transaction } from 'ethereumjs-tx';

const web3 = new Web3(Utils.getFakeProvider());
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
const chainID = 4; //Rinkeby
const chainName = "rinkeby";
const edgeContractAddress = "0xAd14652864994d93FeDb1B7f59337372C453E6BD";

/* This function only works for native ETH => ERC-20 swaps. */
export async function generateSwapTransactionsForUniswapRouter (swapRequest) {
  const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const uniswapRouterInterface = Utils.loadContractAbi("uniswap-router");
  const uniswapContract = new web3.eth.Contract(uniswapRouterInterface, uniswapRouterAddress);
  const path = [swapRequest.fromCurrencyCode, swapRequest.toCurrencyCode];

  /* swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) */
  const swapContractFilled = uniswapContract.methods.swapExactETHForTokens(0, path, swapRequest.fromWallet.address, deadline).encodeABI();

  const swapTransaction = {
      chainId: chainID,
      nonce: swapRequest.fromWallet.nonce,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: web3.utils.toHex(swapRequest.nativeAmount),
      to: uniswapRouterAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  const swapTx = new Transaction(swapTransaction, { chain: chainName })
  return [swapTx];
}

export async function generateSwapTransactionsForEdgeContract (swapRequest) {
  if(swapRequest.fromCurrencyCode === "ETH")  //we don't need approval in this case
    return await generateSwapTransactionFromETH(swapRequest);

  const approveTx = await generateApprovalTransaction(swapRequest);

  let swapTx;
  if(swapRequest.toCurrencyCode === "ETH")
    swapTx = await generateSwapTransactionToETH(swapRequest)
  else
    swapTx = await generateSwapTransaction(swapRequest);

  return [approveTx, swapTx];
}

async function generateSwapTransactionToETH (swapRequest) {
  const edgeContractInterface = Utils.loadContractAbi("edge-swap");
  const swapContract = new web3.eth.Contract(edgeContractInterface, edgeContractAddress);

                                      /* function swapToETH(address _tokenIn, uint _amountIn, uint _amountOutMin) */
  const swapContractFilled = swapContract.methods.swapToETH(swapRequest.fromCurrencyCode, swapRequest.nativeAmount, 0).encodeABI();

  const swapTransaction = {
      chainId: chainID,
      nonce: swapRequest.fromWallet.nonce + 1,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: web3.utils.toHex(swapRequest.nativeAmount),
      to: edgeContractAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  return new Transaction(swapTransaction, { chain: chainName })
}

async function generateSwapTransactionFromETH (swapRequest) {
  const edgeContractInterface = Utils.loadContractAbi("edge-swap");
  const swapContract = new web3.eth.Contract(edgeContractInterface, edgeContractAddress);

                                      /* function swapFromETH(address _tokenOut, uint _amountOutMin) */
  const swapContractFilled = swapContract.methods.swapFromETH(swapRequest.toCurrencyCode, 0).encodeABI();

  const swapTransaction = {
      chainId: chainID,
      nonce: swapRequest.fromWallet.nonce,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: web3.utils.toHex(swapRequest.nativeAmount),
      to: edgeContractAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  const swapTx = new Transaction(swapTransaction, { chain: chainName })
  return [swapTx];
}

async function generateSwapTransaction (swapRequest) {
  const edgeContractInterface = Utils.loadContractAbi("edge-swap");
  const swapContract = new web3.eth.Contract(edgeContractInterface, edgeContractAddress);

  /* function swapFromERC20(address _tokenIn, address _tokenOut, uint _amountIn, uint _amountOutMin) */
  const swapContractFilled = swapContract.methods.swapFromERC20(swapRequest.fromCurrencyCode, swapRequest.toCurrencyCode, swapRequest.nativeAmount, 0).encodeABI();

  const swapTransaction = {
      chainId: chainID,
      nonce: swapRequest.fromWallet.nonce + 1,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: 0,
      to: edgeContractAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  return new Transaction(swapTransaction, { chain: chainName })
}

async function generateApprovalTransaction (swapRequest) {

  // TODO: approve infinitely
  // TODO: check if approval already exists
  // TODO: minimize gas

  const erc20TokenContract = new web3.eth.Contract(Utils.loadContractAbi("erc-20"), swapRequest.fromCurrencyCode);

  const approveEncodedABI = erc20TokenContract.methods
    .approve(edgeContractAddress, swapRequest.nativeAmount)
    .encodeABI();

  const approveSpendTransaction = {
      chainId: chainID,
      nonce: swapRequest.fromWallet.nonce,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      to: swapRequest.fromCurrencyCode,
      from: swapRequest.fromWallet.address,
      data: approveEncodedABI
  };

  return new Transaction(approveSpendTransaction, { chain: chainName })
}

import { Token, Fetcher, Route, Trade, TokenAmount, TradeType } from "@uniswap/sdk";

export async function fetchSwapQuote(swapRequest) {
  const sourceToken = await Fetcher.fetchTokenData(chainID, swapRequest.fromCurrencyCode);
  const destinationToken = await Fetcher.fetchTokenData(chainID, swapRequest.toCurrencyCode);

  try {
    const pair = await Fetcher.fetchPairData(sourceToken, destinationToken);
    const route = new Route([pair], sourceToken);
    const trade = new Trade(
      route,
      new TokenAmount(sourceToken, swapRequest.nativeAmount),
      TradeType.EXACT_INPUT
    );
    // console.log("executionPrice: ", trade.executionPrice.toSignificant(6));
    // console.log("nextMidPrice: ", trade.nextMidPrice.toSignificant(6));
    // console.log("midPrice.invert: ", route.midPrice.invert().toSignificant(6));
    return trade.executionPrice.toSignificant(6);
  } catch (error) {
    if (error.message.includes("getReserves"))
      throw new Error("no liquidity");
    else if (error.message.includes("ADDRESSES"))
      throw new Error("source and destination assets are the same");
    else
      console.log("Unexpected error: " + error);
  }
}
