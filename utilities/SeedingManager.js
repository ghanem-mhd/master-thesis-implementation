require('dotenv').config();

var ethers = require('ethers');
var web3 = require('web3');

var ProvidersManager = require('./ProvidersManager');
var KeyManager = require('./KeyManager')
var contract = require('@truffle/contract')
var roleManagerArtifacts = require('../build/contracts/RoleManager.json');

module.exports = {
    seedEntities: async function(networkName){
        var provider = ProvidersManager.getProvider(networkName)
        try{
            var adminAddress = KeyManager.getAdminAddrees();
            var roleManagerContract = contract(roleManagerArtifacts)
            roleManagerContract.setProvider(provider)
            var roleManagerInstance = await roleManagerContract.deployed();


            var CUSTOMER_ROLE = await roleManagerInstance.CUSTOMER_ROLE();
            var customerAddreess = KeyManager.getAddrees('customer');
            roleManagerInstance.grantRole(CUSTOMER_ROLE, customerAddreess, {from:adminAddress})

            var SUPPLIER_ROLE = await roleManagerInstance.SUPPLIER_ROLE();
            var supplierAddreess = KeyManager.getAddrees('supplier')
            roleManagerInstance.grantRole(SUPPLIER_ROLE, supplierAddreess, {from:adminAddress})

            var MANUFACTURER_ROLE = await roleManagerInstance.MANUFACTURER_ROLE();
            var manufacturerAddreess = KeyManager.getAddrees('manufacturer')
            roleManagerInstance.hasRole(MANUFACTURER_ROLE, manufacturerAddreess, {from:adminAddress})
        } catch(err){
            console.log(err.message)
        }finally{
            provider.engine.stop()
        }
    }
}

for (var i=0; i<process.argv.length;i++) {
    switch (process.argv[i]) {
        case 'seedEntities':
        module.exports.seedEntities(process.argv[i+1])
        break;
    }
}