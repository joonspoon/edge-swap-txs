import { currencyInfo } from './edgery.js';

import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const secrets = require('./secrets.json') // use the require method
const Web3 = require("web3");

export function getRinkebyAddressFromCurrencyCode(currencyCode) {
  const tokenMeta = currencyInfo.metaTokens.find(token => token.currencyCode == currencyCode);
  if (tokenMeta) return tokenMeta.rinkebyAddress;
  else return "ETH";  // ERC-20 token not found in available selection, so assume this is ETH
}

export function getAddressFromCurrencyCode(currencyCode) {
  return currencyInfo.metaTokens.find(token => token.currencyCode == currencyCode).contractAddress;
}

export function signAndSendTransaction(transaction) {
    const privateKeyInHex = new Buffer.from(secrets.privateKey, "hex");
    transaction.sign(privateKeyInHex);
    const serializedEthTx = transaction.serialize().toString("hex");
    const web3 = new Web3(getProvider());
    return web3.eth.sendSignedTransaction(`0x${serializedEthTx}`);
}

export function getFakeProvider() {
  return new Web3.providers.HttpProvider("https://www.google.com");
}

export function getProvider() {
  return new Web3.providers.HttpProvider(`https://eth-rinkeby.alchemyapi.io/v2/${secrets.alchemyApiKey}`)
}

export function loadContractAbi(contractName) {
    let builtContract = require("../contracts/" + contractName + ".json");
    return builtContract.abi;
}

export async function getNonceForWallet(walletAddress) {
  const web3 = new Web3(getProvider());
  return web3.eth.getTransactionCount(walletAddress);
}
