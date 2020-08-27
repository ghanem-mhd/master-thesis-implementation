require("dotenv").config()

var ContractsManager    = require("../utilities/contracts-manager");
var Logger              = require("../utilities/logger");

var contractsAsyncGets = [
    ContractsManager.getWeb3Contract(process.env.NETWORK, "VGR"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "HBW"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "MPO"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SLD"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SupplyLine"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "ProductionLine"),
];

Promise.all(contractsAsyncGets).then( async contracts => {
    var VGRContract = contracts[0];
    var HBWContract = contracts[1];
    var MPOContract = contracts[2];
    var SLDContract = contracts[3];
    var supplyLineContract = contracts[4];
    var productionLineContract = contracts[5];

    var seedSupplyLineCommands = [
        supplyLineContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        supplyLineContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeManufacturer(supplyLineContract._address).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeManufacturer(supplyLineContract._address).send({from:process.env.ADMIN})
    ];

    var seedProductionLineCommands = [
        productionLineContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        productionLineContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN}),
        productionLineContract.methods.setMPOContractAddress(MPOContract._address).send({from:process.env.ADMIN}),
        productionLineContract.methods.setSLDContractAddress(SLDContract._address).send({from:process.env.ADMIN}),
        VGRContract.methods.authorizeManufacturer(productionLineContract._address).send({from:process.env.ADMIN}),
        HBWContract.methods.authorizeManufacturer(productionLineContract._address).send({from:process.env.ADMIN}),
        MPOContract.methods.authorizeManufacturer(productionLineContract._address).send({from:process.env.ADMIN}),
        SLDContract.methods.authorizeManufacturer(productionLineContract._address).send({from:process.env.ADMIN})
    ];

    await Promise.all(seedSupplyLineCommands);
    Logger.info("SupplyLine seeding finished");

    Promise.all(seedProductionLineCommands);
    Logger.info("ProductionLine seeding finished");

    process.exit(0);
}).catch( error => {
    Logger.error(error.stack);
});
