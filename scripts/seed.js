require("dotenv").config()

var ContractsManager    = require("../utilities/contracts-manager");
var ProvidersManager    = require("../utilities/providers-manager");
var Logger              = require("../utilities/logger");

var contractsAsyncGets = [
    ContractsManager.getWeb3Contract(process.env.NETWORK, "VGR"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "HBW"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SupplyLine"),
];

Promise.all(contractsAsyncGets).then( contracts => {
    var VGRContract = contracts[0];
    var HBWContract = contracts[1];
    var supplyLineContract = contracts[2];

    var seedSupplyLineCommands = [
        supplyLineContract.methods.setVGRContractAddress(VGRContract._address).send({from:process.env.ADMIN}),
        supplyLineContract.methods.setHBWContractAddress(HBWContract._address).send({from:process.env.ADMIN})
    ];

    Promise.all(seedSupplyLineCommands).then( receipt => {
        Logger.info("SupplyLine seeding finished");
        process.exit(0);
    });

}).catch( error => {
    Logger.error(error.stack);
});
