var Web3 = require("web3");
var TruffleContract = require("@truffle/contract");
var ProvidersManager = require("./providers-manager");
var Logger = require("./logger");

module.exports = {
  getWeb3Contract: async function (networkName, contractName) {
    try {
      var provider = ProvidersManager.getWSProvider(networkName);
      var web3 = new Web3(provider);
      var artifact = require(`../build/contracts/${contractName}.json`);
      var contract = TruffleContract(artifact);
      contract.setProvider(provider);
      var deployedInstance = await contract.deployed();
      return new web3.eth.Contract(artifact.abi, deployedInstance.address);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getTruffleContract: function (provider, contractName) {
    var artifact = require(`../build/contracts/${contractName}.json`);
    var contract = TruffleContract(artifact);
    contract.setProvider(provider);
    return contract.deployed();
  },
  getRegistryContract: async function (provider) {
    var artifact = require("../ethr-did-registry/build/contracts/EthereumDIDRegistry.json");
    var contract = TruffleContract(artifact);
    contract.setProvider(provider);
    var deployedInstance = await contract.deployed();
    return deployedInstance;
  },
};
