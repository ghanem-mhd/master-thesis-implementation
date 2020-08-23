require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../utilities/providers-manager");
var KeyManager = require("../utilities/keys-manager");
var ContractManager = require("../utilities/contracts-manager");
var Logger = require("../utilities/logger");
var Helper = require('../../utilities/helper');

mqttClient = mqtt.connect(process.env.CURRENT_MQTT);

var contractsAsyncGets = [
    ContractsManager.getWeb3Contract(process.env.NETWORK, "VGR"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "HBW"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SupplyLine"),
];

Promise.all(contractsAsyncGets).then( contracts => {
    var VGRContract = contracts[0];
    var HBWContract = contracts[1];
    var supplyLineContract = contracts[2];

    VGRContract.events.TaskFinished({ fromBlock: 0 }, onVGRTaskFinished);
    HBWContract.events.TaskFinished({ fromBlock: 0 }, onHBWTaskFinished);

}).catch( error => {
    Logger.error(error.stack);
});


var onVGRTaskFinished = async function(error, event){
    if (error){
        Logger.error(error);
    }else{
        var taskID      = event.returnValues["taskID"];
        var taskName    = event.returnValues["taskName"];

    }
}

var onHBWTaskFinished = async function(error, event){
    if (error){
        Logger.error(error);
    }else{
        var taskID      = event.returnValues["taskID"];
        var taskName    = event.returnValues["taskName"];

    }
}

