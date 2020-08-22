require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../utilities/providers-manager");
var KeyManager = require("../utilities/keys-manager");
var ContractManager = require("../utilities/contracts-manager");
var Logger = require("../utilities/logger");


var provider    = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);

function killAllTasks(instance){
    instance.getTasksCount().then( tasksCount => {
        for (let taskID = 1; taskID <= tasksCount; taskID++) {
            instance.killTask(taskID, {from: provider.addresses[0]}).then( receipt=> {
                Logger.info("task " + taskID + " is killed");
            });
        }
    });
}

ContractManager.getTruffleContract(provider, 'HBW').then( (instance) => {
    killAllTasks(instance);
});

ContractManager.getTruffleContract(provider, 'SLD').then( (instance) => {
    killAllTasks(instance);
});

ContractManager.getTruffleContract(provider, 'VGR').then( (instance) => {
    killAllTasks(instance);
});

ContractManager.getTruffleContract(provider, 'MPO').then((instance) => {
    killAllTasks(instance);
});