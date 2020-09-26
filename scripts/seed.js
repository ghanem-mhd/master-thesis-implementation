require("dotenv").config()

var Helper              = require("../utilities/helper");
var ContractsManager    = require("../utilities/contracts-manager");
var Logger              = require("../utilities/logger");

var contractsAsyncGets = [
    ContractsManager.getWeb3Contract(process.env.NETWORK, "VGR"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "HBW"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "MPO"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SLD"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SupplyingProcess"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "ProductionProcess"),
];

Promise.all(contractsAsyncGets).then( async contracts => {
    var VGRContract = contracts[0];
    var HBWContract = contracts[1];
    var MPOContract = contracts[2];
    var SLDContract = contracts[3];
    var supplyingProcessContract = contracts[4];
    var productionProcessContract = contracts[5];

    var seedSupplyingProcessCommands = [
        supplyingProcessContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        supplyingProcessContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeManufacturer(supplyingProcessContract._address).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeManufacturer(supplyingProcessContract._address).send({from:process.env.ADMIN})
    ];

    await Promise.all(seedSupplyingProcessCommands);
    Logger.info("SupplyingProcess seeding finished");

    var seedProductionProcessCommands = [
        productionProcessContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        productionProcessContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN}),
        productionProcessContract.methods.setMPOContractAddress(MPOContract._address).send({from:process.env.ADMIN}),
        productionProcessContract.methods.setSLDContractAddress(SLDContract._address).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeManufacturer(productionProcessContract._address).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeManufacturer(productionProcessContract._address).send({from:process.env.ADMIN}),
        MPOContract.methods.authorizeManufacturer(productionProcessContract._address).send({from:process.env.ADMIN}),
        SLDContract.methods.authorizeManufacturer(productionProcessContract._address).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN}),
        MPOContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN}),
        SLDContract.methods.authorizeMaintainer(process.env.MAINTAINER).send({from:process.env.ADMIN})
    ];
    await Promise.all(seedProductionProcessCommands);
    Logger.info("ProductionProcess seeding finished");

    var VGRInfoCommands = [
        VGRContract.methods.saveMachineInfo(Helper.toHex("Serial No."), Helper.toHex("4CE0460D0G")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        VGRContract.methods.saveMachineInfo(Helper.toHex("Model No."),  Helper.toHex("X8zRQm4D")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS})
    ];
    await Promise.all(VGRInfoCommands);
    Logger.info("VGR seeding finished");

    var SLDInfoCommands = [
        SLDContract.methods.saveMachineInfo(Helper.toHex("Serial No."), Helper.toHex("JXqAg7Mh")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        SLDContract.methods.saveMachineInfo(Helper.toHex("Model No."),  Helper.toHex("GKHJXur2")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        SLDContract.methods.saveMaintenanceOperation("Replace part no. U6DmXrdC").send({from:process.env.MAINTAINER, gas: process.env.DEFAULT_GAS}),
    ];
    await Promise.all(SLDInfoCommands);
    Logger.info("SLD seeding finished");

    var MPOInfoCommands = [
        MPOContract.methods.saveMachineInfo(Helper.toHex("Serial No."), Helper.toHex("Us25vnzA")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        MPOContract.methods.saveMachineInfo(Helper.toHex("Model No."),  Helper.toHex("U6DmXrdC")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS})
    ];
    await Promise.all(MPOInfoCommands);
    Logger.info("MPO seeding finished");


    var HBWInfoCommands = [
        HBWContract.methods.saveMachineInfo(Helper.toHex("Serial No."), Helper.toHex("2SDsjAEE")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
        HBWContract.methods.saveMachineInfo(Helper.toHex("Model No."),  Helper.toHex("Zr4e8wFb")).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}),
    ];
    await Promise.all(HBWInfoCommands);
    Logger.info("HBW seeding finished");

    process.exit(0);
}).catch( error => {
    Logger.error(error.stack);
});
