import { ethers } from "ethers";
import * as Utils from './src/utils.js';

import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const secrets = require('./src/secrets.json') // use the require method

const proxyContractAddress = '0xAd14652864994d93FeDb1B7f59337372C453E6BD'; //Rinkeby testnet
const proxyContractInterface = [ "function withdrawFees() external" ];

const goerliProvider = ethers.providers.getDefaultProvider('goerli');
const ethersWallet = new ethers.Wallet(secrets.privateKey, goerliProvider);
const signedContract = new ethers.Contract(proxyContractAddress, proxyContractInterface, ethersWallet);

var gasOptions = { gasPrice: 1000000000, gasLimit: 1000000};

const result = await signedContract.withdrawFees(gasOptions);
const { hash } = result;
console.log( "https://goerli.etherscan.io/tx/" + hash);


// const proxyContractInterface = [ "function withdrawExoticFees(address _token, address _recipient) external" ];
// const uniAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
// const walletAddress = "0x0c74caFf031C9cefbBCdF84Ed5363f928078DA51";
// var gasOptions = { gasPrice: 1000000000, gasLimit: 100000};
// const goerliProvider = ethers.providers.getDefaultProvider('goerli');
// const ethersWallet = new ethers.Wallet(secrets.ownerPrivateKey, goerliProvider);
// const signedContract = new ethers.Contract(proxyContractAddress, proxyContractInterface, ethersWallet);
// const result = await signedContract.withdrawExoticFees(uniAddress, walletAddress, gasOptions);
// const { hash } = result;
// console.log( "https://goerli.etherscan.io/tx/" + hash);
