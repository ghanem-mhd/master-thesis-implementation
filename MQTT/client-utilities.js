require("dotenv").config();

var ContractManager = require("../utilities/contracts-manager");
var ProvidersManager = require("../utilities/providers-manager");
var Helper = require("../utilities/helper");
var Logger = require("../utilities/logger");

var JWT = require("did-jwt");
var Web3 = require('web3');
var ethers = require('ethers');

module.exports = {
    getTaskInfoFromTaskAssignedEvent: function (event) {
        var task = {}
        task.taskID                  = event.returnValues["taskID"];
        task.taskName                = event.returnValues["taskName"];
        task.productDID              = event.returnValues["productDID"];
        task.processID               = event.returnValues["processID"];
        task.processContractAddress  = event.returnValues["processContractAddress"];
        return task;
    },
    getReadingType: function (event) {
        var ReadingTypeMapping = ["t", "h", "p", "gr", "br"];
        var readingTypeIndex = event.returnValues["readingType"];
        var readingType = ReadingTypeMapping[readingTypeIndex];
        return { readingTypeIndex, readingType };
    },
    getTaskInputRequest: function (machineContract, taskID, inputName) {
        return machineContract.getTaskInput(taskID, Helper.toHex(inputName))
    },
    getTaskInputs: function (machineContract, taskID, inputsNames) {
        requests = [];
        inputsNames.forEach(inputName => {
            requests.push(module.exports.getTaskInputRequest(machineContract, taskID, inputName));
        });
        return Promise.all(requests);
    },
    registerCallbackForEvent(clientName, contractName, eventName, callback){
        ContractManager.getWeb3Contract(process.env.NETWORK, contractName).then(Contract => {
            Contract.events[eventName]({ fromBlock: "latest" }, (error, event) => {
                if (error){
                    Logger.error(error.stack);
                }else{
                    callback(event);
                }
            });
            Logger.logEvent(clientName, `Started listening for ${eventName} event in contract ${contractName}`);
        }).catch(error => {
            Logger.error(error.stack);
        });
    },
    getTaskWithStatus(clientName, contract, taskAssignedEvent) {
        return new Promise(function (resolve, reject) {
            var task = module.exports.getTaskInfoFromTaskAssignedEvent(taskAssignedEvent);
            contract.isTaskFinished(task.taskID).then(isFinished => {
            if (isFinished) {
                task.isFinished = true
                resolve(task);
            } else {
                task.isFinished = false
                resolve(task);
            }
            Logger.logEvent(clientName, `Task ${task.taskName} ${task.taskID} is assigned`, {task:task, taskAssignedEvent: taskAssignedEvent});
            }).catch(error => {
                reject(error);
            });
        });
    },
    getOrderStateMessage: function (state, type) {
        var message = {}
        message["type"] = String(type);
        message["state"] = String(state);
        message["ts"] = new Date().toISOString();
        return message;
    },
    getSoundMessage: function (code) {
        var message = {}
        message["code"] = code
        message["ts"] = new Date().toISOString();
        return message;
    },
    createCredential(keyIndex, productID, operationName, operationResult) {
        var key = ethers.Wallet.fromMnemonic(process.env.ADMIN_MNEMONIC, "m/44'/60'/0'/0/" + keyIndex);
        var signer = JWT.SimpleSigner(key.privateKey);

        var productDID = "did:ethr:" + productID;
        var machineDID = "did:ethr:" + key.address;


        var jwtPayload = { aud: productDID }
        jwtPayload["operationName"] = operationName;
        jwtPayload["operationResult"] = operationResult;

        var jwtOptions = { alg: 'ES256K', issuer: machineDID, signer }

        return JWT.createJWT(jwtPayload, jwtOptions);
    },
    storeCredential(clientName, productID, encodedCredential, operationName, operationResult) {
        var doc = {}
        doc["productID"] = "did:ethr:" + productID;
        doc["encodedCredentials"] = encodedCredential;

        doc["operationName"] = operationName;
        doc["operationResult"] = operationResult;
    },
    getTaskMessageObject: function (task, code) {
        var taskMessage = {}
        taskMessage["processID"]  = parseInt(task.processID);
        taskMessage["productDID"] = String(task.productDID);
        taskMessage["taskID"]     = parseInt(task.taskID);
        taskMessage["ts"]         = new Date().toISOString();
        taskMessage["code"]       = code;
        return taskMessage;
    },
    getAckMessageInfo(incomingAckMessage){
        var taskID      = incomingAckMessage["taskID"];
        var productDID  = incomingAckMessage["productDID"];
        var processID   = incomingAckMessage["processID"];
        var code        = incomingAckMessage["code"];
        return { taskID, productDID, processID, code };
    },
    sendFinishTaskTransaction(clientName, contract, machineAddress, taskID){
        contract.getTask(taskID).then( task => {
            contract.finishTask(taskID, {from:machineAddress, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(clientName, `Task ${task[1]} ${taskID} is finished`, receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }).catch(error => {
            Logger.error(error.stack);
        })
    },
    sendTaskStartTransaction(clientName, contract, machineAddress, taskAssignedEvent){
        return new Promise(function (resolve, reject) {
            var task = module.exports.getTaskInfoFromTaskAssignedEvent(taskAssignedEvent);
            contract.startTask(task.taskID, {from:machineAddress, gas: process.env.DEFAULT_GAS}).then(receipt => {
                Logger.logEvent(clientName, `Task ${task.taskName} ${task.taskID} is started`, receipt);
                resolve(task)
            }).catch(error => {
                reject(error);
            });
        });
    }
}