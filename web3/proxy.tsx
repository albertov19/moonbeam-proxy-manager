import web3 from './web3';
const proxyInterface = require('./abi/ProxyABI.json');
const ethers = require('ethers');

const proxyInstance = () => {
  const address = '0x000000000000000000000000000000000000080b';
  return new ethers.Contract(address, proxyInterface.abi, web3().getSigner());
};

export default proxyInstance;
