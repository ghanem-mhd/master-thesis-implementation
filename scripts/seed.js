require("dotenv").config()

var web3                = require('web3')
var ContractsManager    = require("../utilities/contracts-manager");
var Logger              = require("../utilities/logger");


function toHex(string){
    return web3.utils.padRight(web3.utils.asciiToHex(string), 64)
}

var contractsAsyncGets = [
    ContractsManager.getWeb3Contract(process.env.NETWORK, "VGR"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "HBW"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "MPO"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SLD"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SupplyingProcess"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "ProductionProcess"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "Product"),
];

Promise.all(contractsAsyncGets).then( async contracts => {
    var VGRContract                 = contracts[0];
    var HBWContract                 = contracts[1];
    var MPOContract                 = contracts[2];
    var SLDContract                 = contracts[3];
    var supplyingProcessContract    = contracts[4];
    var productionProcessContract   = contracts[5];
    var productContract             = contracts[6];

    var productCommands = [
        productContract.methods.createProduct(process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER}),
        productContract.methods.authorizeManufacturer(process.env.MANUFACTURER, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER})
    ];
    await Promise.all(productCommands);
    Logger.info("Product seeding finished");

    var seedSupplyingProcessCommands = [
        supplyingProcessContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        supplyingProcessContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeManufacturer(process.env.MANUFACTURER).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeManufacturer(process.env.MANUFACTURER).send({from:process.env.ADMIN})
    ];

    await Promise.all(seedSupplyingProcessCommands);
    Logger.info("SupplyingProcess seeding finished");

    var seedProductionProcessCommands = [
        productionProcessContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        productionProcessContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN}),
        productionProcessContract.methods.setMPOContractAddress(MPOContract._address).send({from:process.env.ADMIN}),
        productionProcessContract.methods.setSLDContractAddress(SLDContract._address).send({from:process.env.ADMIN}),
        MPOContract.methods.authorizeManufacturer(process.env.MANUFACTURER).send({from:process.env.ADMIN}),
        SLDContract.methods.authorizeManufacturer(process.env.MANUFACTURER).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN}),
        MPOContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN}),
        SLDContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN})
    ];
    await Promise.all(seedProductionProcessCommands);
    Logger.info("ProductionProcess seeding finished");

    var VGRInfoCommands = [
        VGRContract.methods.saveMachineInfo(toHex("Serial No."), toHex("4CE0460D0G")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        VGRContract.methods.saveMachineInfo(toHex("Model No."),  toHex("X8zRQm4D")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS})
    ];
    await Promise.all(VGRInfoCommands);
    Logger.info("VGR seeding finished");

    var SLDInfoCommands = [
        SLDContract.methods.saveMachineInfo(toHex("Serial No."), toHex("JXqAg7Mh")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        SLDContract.methods.saveMachineInfo(toHex("Model No."),  toHex("GKHJXur2")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        SLDContract.methods.saveMaintenanceOperation("Replace part no. U6DmXrdC").send({from:process.env.MAINTAINER, gas: process.env.DEFAULT_GAS}),
    ];
    await Promise.all(SLDInfoCommands);
    Logger.info("SLD seeding finished");

    var MPOInfoCommands = [
        MPOContract.methods.saveMachineInfo(toHex("Serial No."), toHex("Us25vnzA")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        MPOContract.methods.saveMachineInfo(toHex("Model No."),  toHex("U6DmXrdC")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS})
    ];
    await Promise.all(MPOInfoCommands);
    Logger.info("MPO seeding finished");


    var HBWInfoCommands = [
        HBWContract.methods.saveMachineInfo(toHex("Serial No."), toHex("2SDsjAEE")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        HBWContract.methods.saveMachineInfo(toHex("Model No."),  toHex("Zr4e8wFb")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
    ];
    await Promise.all(HBWInfoCommands);
    Logger.info("HBW seeding finished");

    process.exit(0);
}).catch( error => {
    Logger.error(error.stack);
});
