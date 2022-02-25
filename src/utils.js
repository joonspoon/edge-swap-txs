import { currencyInfo } from './edgery.js';

import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const secrets = require('./secrets.json') // use the require method
const Web3 = require("web3");

export function getRinkebyAddressFromCurrencyCode(currencyCode) {
  return currencyInfo.metaTokens.find(token => token.currencyCode == currencyCode).rinkebyAddress;
}

export function getAddressFromCurrencyCode(currencyCode) {
  return currencyInfo.metaTokens.find(token => token.currencyCode == currencyCode).contractAddress;
}

export function signAndSendTransaction(transaction) {
    const privateKeyInHex = new Buffer.from(secrets.privateKey, "hex");
    transaction.sign(privateKeyInHex);
    const serializedEthTx = transaction.serialize().toString("hex");
    var web3 = new Web3(getProvider());
    return web3.eth.sendSignedTransaction(`0x${serializedEthTx}`);
}

export function getProvider() {
  return new Web3.providers.HttpProvider( `https://eth-rinkeby.alchemyapi.io/v2/${secrets.alchemyApiKey}`)
}

export function loadContractAbi(contractName) {
    let builtContract = require("../contracts/" + contractName + ".json");
    return builtContract.abi;
}
