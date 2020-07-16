var Web3 = require('web3');
var TruffleContract = require('@truffle/contract')
var ProvidersManager = require('./providers-manager')

module.exports = {

    

    getWeb3Contract: async function(networkName, contractName) {
        var provider = ProvidersManager.getWSProvider(networkName)
        var web3 = new Web3(provider)
        var artifact = require(`../build/contracts/${contractName}.json`)
        var contract = TruffleContract(artifact)
        contract.setProvider(provider)
        var deployedInstance = await contract.deployed()
        return new web3.eth.Contract(artifact.abi, deployedInstance.address);
    },
    getTruffleContract: async function(networkName, contractName, privateKeyOrMnemonic) {
        var provider = ProvidersManager.getHttpProvider(networkName, privateKeyOrMnemonic)
        var artifact = require(`../build/contracts/${contractName}.json`)
        var contract = TruffleContract(artifact)
        contract.setProvider(provider)
        var deployedInstance = await contract.deployed()
        return deployedInstance;
    }
}