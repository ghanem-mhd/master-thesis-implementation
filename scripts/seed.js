require("dotenv").config()

const Web3                = require('web3')
const ContractsManager    = require("../utilities/contracts-manager");
const ProviderManager     = require("../utilities/providers-manager");
const Logger              = require("../utilities/logger");
const Helper              = require("../utilities/helper");

var adminProvider           = ProviderManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_PRIVATE_KEY);
var productOwnerProvider    = ProviderManager.getHttpProvider(process.env.NETWORK, process.env.PRODUCT_OWNER_PK);
var machineOwnerProvider    = ProviderManager.getHttpProvider(process.env.NETWORK, process.env.MACHINE_OWNER_PK);

var contractsAsyncGets = [
    ContractsManager.getTruffleContract(machineOwnerProvider, "VGR"),
    ContractsManager.getTruffleContract(machineOwnerProvider, "HBW"),
    ContractsManager.getTruffleContract(machineOwnerProvider, "MPO"),
    ContractsManager.getTruffleContract(machineOwnerProvider, "SLD"),
    ContractsManager.getTruffleContract(adminProvider, "SupplyingProcess"),
    ContractsManager.getTruffleContract(adminProvider, "ProductionProcess"),
    ContractsManager.getTruffleContract(productOwnerProvider, "Product"),
];

Promise.all(contractsAsyncGets).then( async contracts => {
    var VGRContract                 = contracts[0];
    var HBWContract                 = contracts[1];
    var MPOContract                 = contracts[2];
    var SLDContract                 = contracts[3];
    var supplyingProcessContract    = contracts[4];
    var productionProcessContract   = contracts[5];
    var productContract             = contracts[6];

    try{
        Logger.info("Funding accounts started");
        var web3 = new Web3(adminProvider)
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.VGR_ADDRESS, value:web3.utils.toWei("100","ether")});
        Logger.info("Fund VGR " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.HBW_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund HBW " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.MPO_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund MPO " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.SLD_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund SLD " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.MANUFACTURER_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund Manufacturer " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.MAINTAINER_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund Maintainer " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.PRODUCT_OWNER_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund Product Owner " + receipt.transactionHash);
        receipt = await web3.eth.sendTransaction({from:adminProvider.addresses[0], to: process.env.MACHINE_OWNER_ADDRESS , value:web3.utils.toWei("100","ether")});
        Logger.info("Fund Machines Owner " + receipt.transactionHash);
    } catch (error) {
        Logger.error(error.stack);
    } finally {
        Logger.info("Funding accounts finished");
    }

    try {
        Logger.info("Product seeding started");
        receipt = await Helper.sendTransaction(productContract.createProduct(process.env.DUMMY_PRODUCT, {from:process.env.PRODUCT_OWNER_ADDRESS}));
        Logger.info("createProduct "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(productContract.authorizeManufacturer(process.env.MANUFACTURER_ADDRESS, process.env.DUMMY_PRODUCT, {from:process.env.PRODUCT_OWNER_ADDRESS}));
        Logger.info("authorizeManufacturer "+ receipt.transactionHash);
    } catch (error) {
        Logger.error(error.message);
    } finally {
        Logger.info("Product seeding finished");
    }

    try {
        Logger.info("SupplyingProcess seeding started");
        receipt = await Helper.sendTransaction(supplyingProcessContract.setVGRContractAddress(VGRContract.address, {from:adminProvider.addresses[0]}));
        Logger.info("setVGRContractAddress "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(supplyingProcessContract.setHBWContractAddress(HBWContract.address, {from:adminProvider.addresses[0]}));
        Logger.info("setHBWContractAddress "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(VGRContract.authorizeManufacturer(process.env.MANUFACTURER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeManufacturer1 "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(HBWContract.authorizeManufacturer(process.env.MANUFACTURER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeManufacturer2 "+ receipt.transactionHash);
    } catch (error) {
        Logger.error(error.message);
    } finally {
        Logger.info("SupplyingProcess seeding finished");
    }

    try {
        Logger.info("ProductionProcess seeding started");
        receipt = await Helper.sendTransaction(productionProcessContract.setVGRContractAddress(VGRContract.address, {from:adminProvider.addresses[0]}));
        Logger.info("setVGRContractAddress "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(productionProcessContract.setHBWContractAddress(HBWContract.address, {from:adminProvider.addresses[0]}));
        Logger.info("setHBWContractAddress "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(productionProcessContract.setMPOContractAddress(MPOContract.address, {from:adminProvider.addresses[0]}));
        Logger.info("setMPOContractAddress "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(productionProcessContract.setSLDContractAddress(SLDContract.address, {from:adminProvider.addresses[0]}));
        Logger.info("setSLDContractAddress "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(MPOContract.authorizeManufacturer(process.env.MANUFACTURER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeManufacturer1 "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(SLDContract.authorizeManufacturer(process.env.MANUFACTURER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeManufacturer2 "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(VGRContract.authorizeMaintainer(process.env.MAINTAINER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeMaintainer1 "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(HBWContract.authorizeMaintainer(process.env.MAINTAINER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeMaintainer2 "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(MPOContract.authorizeMaintainer(process.env.MAINTAINER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeMaintainer3 "+ receipt.transactionHash);
        receipt = await Helper.sendTransaction(SLDContract.authorizeMaintainer(process.env.MAINTAINER_ADDRESS, {from:machineOwnerProvider.addresses[0]}));
        Logger.info("authorizeMaintainer4 "+ receipt.transactionHash);
    } catch (error) {
        Logger.error(error.message);
    } finally {
        Logger.info("ProductionProcess seeding finished");
    }
    process.exit(0);
}).catch( error => {
    Logger.error(error.stack);
    process.exit(0);
});
