require('dotenv').config()

var ethers = require('ethers')
var Web3 = require('web3')

var ProvidersManager = require('./ProvidersManager')
var KeyManager = require('./KeyManager')
var contract = require('@truffle/contract')

var roleManagerArtifacts = require('../build/contracts/RoleManager.json')
var entitiesArtifacts = require('../build/contracts/Entities.json')
var devicesArtifacts = require('../build/contracts/Devices.json')

module.exports = {
    seedEntities:async function(networkName){
        var provider = ProvidersManager.getProvider(networkName, process.env.ADMIN_MNEMONIC)
        try{
            var web3 = new Web3(provider)
            var adminAddress = KeyManager.getAddreesFromMnemonic(process.env.ADMIN_MNEMONIC)
            var entitiesContract = contract(entitiesArtifacts)
            entitiesContract.setProvider(provider)
            var entitiesInstance = await entitiesContract.deployed()

            var customerAddreess = KeyManager.getAddreesFromMnemonic(process.env.CUSTOMER_MNEMONIC)
            var supplierAddreess = KeyManager.getAddreesFromMnemonic(process.env.SUPPLIER_MNEMONIC)
            var manufacturerAddreess = KeyManager.getAddreesFromMnemonic(process.env.MANUFACTURER_MNEMONIC)

            await entitiesInstance.addEntity(customerAddreess, "Customer 1", {from:adminAddress})
            await entitiesInstance.addEntity(supplierAddreess, "Supplier 1", {from:adminAddress})
            await entitiesInstance.addEntity(manufacturerAddreess, "Manufacturer 1", {from:adminAddress})


            await web3.eth.sendTransaction({from:adminAddress, to:customerAddreess, value:web3.utils.toWei("10","ether")})
            await web3.eth.sendTransaction({from:adminAddress, to:supplierAddreess, value:web3.utils.toWei("10","ether")})
            await web3.eth.sendTransaction({from:adminAddress, to:manufacturerAddreess, value:web3.utils.toWei("10","ether")})
        } catch(err){
            console.log(err.message)
        }finally{
            provider.engine.stop()
        }
    },
    seedRoles: async function(networkName){
        var provider = ProvidersManager.getProvider(networkName, process.env.ADMIN_MNEMONIC)
        try{
            var adminAddress = KeyManager.getAddreesFromMnemonic(process.env.ADMIN_MNEMONIC)
            var roleManagerContract = contract(roleManagerArtifacts)
            roleManagerContract.setProvider(provider)
            var roleManagerInstance = await roleManagerContract.deployed()


            var CUSTOMER_ROLE = await roleManagerInstance.CUSTOMER_ROLE()
            var customerAddreess =KeyManager.getAddreesFromMnemonic(process.env.CUSTOMER_MNEMONIC)
            await roleManagerInstance.grantRole(CUSTOMER_ROLE, customerAddreess, {from:adminAddress})

            var SUPPLIER_ROLE = await roleManagerInstance.SUPPLIER_ROLE()
            var supplierAddreess = KeyManager.getAddreesFromMnemonic(process.env.SUPPLIER_MNEMONIC)
            await roleManagerInstance.grantRole(SUPPLIER_ROLE, supplierAddreess, {from:adminAddress})

            var MANUFACTURER_ROLE = await roleManagerInstance.MANUFACTURER_ROLE()
            var manufacturerAddreess = KeyManager.getAddreesFromMnemonic(process.env.MANUFACTURER_MNEMONIC)
            await roleManagerInstance.grantRole(MANUFACTURER_ROLE, manufacturerAddreess, {from:adminAddress})
        } catch(err){
            console.log(err.message)
        }finally{
            provider.engine.stop()
        }
    },
    seedDevices: async function(networkName){
        var provider = ProvidersManager.getProvider(networkName, process.env.MANUFACTURER_MNEMONIC)
        try{
            var manufacturerAddreess = KeyManager.getAddreesFromMnemonic(process.env.MANUFACTURER_MNEMONIC)
            var devicesContract = contract(devicesArtifacts)
            devicesContract.setProvider(provider)
            var devicesInstance = await devicesContract.deployed()

            var machine1Id = KeyManager.getAddrees('m1')
            var machine2Id = KeyManager.getAddrees('m2')

            await devicesInstance.addDevice(machine1Id, 'Machine 1', {from:manufacturerAddreess})
            await devicesInstance.addDevice(machine2Id, 'Machine 2', {from:manufacturerAddreess})
        } catch(err){
            console.log(err.message)
        }finally{
            provider.engine.stop()
        }
    },
    seed:function(networkName){
        module.exports.seedEntities(networkName).then( ()=> {
            module.exports.seedRoles(networkName).then( () => {
                module.exports.seedDevices(networkName)
            })
        })
    },
}

for (var i=0; i<process.argv.length;i++) {
    switch (process.argv[i]) {
        case 'seed':
        module.exports.seed(process.argv[i+1])
        break;
    }
}