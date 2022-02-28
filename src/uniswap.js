import * as Utils from './utils.js';
import Web3 from "web3";
import { Transaction } from 'ethereumjs-tx';

const web3 = new Web3(Utils.getFakeProvider());
const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
const edgeContractAddress = "0x84F4d73e9D679fc487cC819f02069096b4aBE210";

/* This function only works for native ETH => ERC-20 swaps. */
export async function generateSwapTransactionsForUniswapRouter (swapRequest) {
  const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const uniswapRouterInterface = Utils.loadContractAbi("uniswap-router");
  const uniswapContract = new web3.eth.Contract(uniswapRouterInterface, uniswapRouterAddress);
  const path = [swapRequest.fromCurrencyCode, swapRequest.toCurrencyCode];

  /* swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) */
  const swapContractFilled = uniswapContract.methods.swapExactETHForTokens(0, path, swapRequest.fromWallet.address, deadline).encodeABI();

  const swapTransaction = {
      chainId: 4, //rinkeby
      nonce: swapRequest.fromWallet.nonce,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: web3.utils.toHex(swapRequest.nativeAmount),
      to: uniswapRouterAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  const swapTx = new Transaction(swapTransaction, { chain: 'rinkeby' })
  return [swapTx];
}

export async function generateSwapTransactionsForEdgeContract (swapRequest) {
  if(swapRequest.fromCurrencyCode === "ETH")
    return await generateSwapTransactionForETH(swapRequest);

  const approveTx = await generateApprovalTransaction(swapRequest);
  const swapTx = await generateSwapTransaction (swapRequest);
  return [approveTx, swapTx];
}

async function generateSwapTransactionForETH (swapRequest) {
  const edgeContractInterface = Utils.loadContractAbi("edge-swap");
  const swapContract = new web3.eth.Contract(edgeContractInterface, edgeContractAddress);

  /* function swapFromETH(address _tokenOut, uint _amountOutMin) */
  const swapContractFilled = swapContract.methods.swapFromETH(swapRequest.toCurrencyCode, 0).encodeABI();

  const swapTransaction = {
      chainId: 4, //rinkeby
      nonce: swapRequest.fromWallet.nonce,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: web3.utils.toHex(swapRequest.nativeAmount),
      to: edgeContractAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  const swapTx = new Transaction(swapTransaction, { chain: 'rinkeby' })
  return [swapTx];
}

async function generateSwapTransaction (swapRequest) {
  const edgeContractInterface = Utils.loadContractAbi("edge-swap");
  const swapContract = new web3.eth.Contract(edgeContractInterface, edgeContractAddress);

  /* function swapFromERC20(address _tokenIn, address _tokenOut, uint _amountIn, uint _amountOutMin) */
  const swapContractFilled = swapContract.methods.swapFromERC20(swapRequest.fromCurrencyCode, swapRequest.toCurrencyCode, swapRequest.nativeAmount, 0).encodeABI();

  const swapTransaction = {
      chainId: 4, //rinkeby
      nonce: swapRequest.fromWallet.nonce + 1,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      value: 0,
      to: edgeContractAddress,
      from: swapRequest.fromWallet.address,
      data: swapContractFilled
  };

  return new Transaction(swapTransaction, { chain: 'rinkeby' })
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
      chainId: 4,
      nonce: swapRequest.fromWallet.nonce,
      gasLimit: web3.utils.toHex(500000),
      gasPrice: web3.utils.toHex(10000000000),
      to: swapRequest.fromCurrencyCode,
      from: swapRequest.fromWallet.address,
      data: approveEncodedABI
  };

  return new Transaction(approveSpendTransaction, { chain: 'rinkeby' })
}
