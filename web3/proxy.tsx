const proxyInterface = require('./abi/ProxyABI.json');
const ethers = require('ethers');

const proxyInstance = (provider) => {
  const address = '0x000000000000000000000000000000000000080b';
  return new ethers.Contract(address, proxyInterface.abi, provider);
};

export default proxyInstance;
