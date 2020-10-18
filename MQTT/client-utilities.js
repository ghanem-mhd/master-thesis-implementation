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
    var taskID                  = event.returnValues["taskID"];
    var taskName                = event.returnValues["taskName"];
    var productDID              = event.returnValues["productDID"];
    var processID               = event.returnValues["processID"];
    var processContractAddress  = event.returnValues["processContractAddress"];
    return { taskID, taskName, productDID, processID, processContractAddress };
  },
  getReadingType: function (event) {
    var ReadingTypeMapping = ["t", "h", "p", "gr", "br"];
    var readingTypeIndex = event.returnValues["readingType"];
    var readingType = ReadingTypeMapping[readingTypeIndex];
    return { readingTypeIndex, readingType };
  },
  getTaskInputRequest: function (machineContract, taskID, inputName) {
    return machineContract.methods.getTaskInput(taskID, Helper.toHex(inputName)).call({})
  },
  getTaskInputs: function (machineContract, taskID, inputsNames) {
    requests = [];
    inputsNames.forEach(inputName => {
      requests.push(module.exports.getTaskInputRequest(machineContract, taskID, inputName));
    });
    return Promise.all(requests);
  },
  registerCallbackForNewTasks: function (clientName, contractName, newTasksCallback, onContractReady) {
    ContractManager.getWeb3Contract(process.env.NETWORK, contractName).then(Contract => {
      onContractReady(Contract)
      Contract.events.TaskAssigned({ fromBlock: "latest" }, newTasksCallback);
      Logger.logEvent(clientName, "Started listening for tasks...");
    }).catch(error => {
      Logger.error(error.stack)
    });
  },
  registerCallbackForNewReadingRequest: function (clientName, contractName, readingRequestCallback) {
    ContractManager.getWeb3Contract(process.env.NETWORK, contractName).then(Contract => {
      Contract.events.NewReading({ fromBlock: "latest" }, readingRequestCallback);
      Logger.logEvent(clientName, "Started listening for reading requests...");
    }).catch(error => {
      Logger.error(error.stack);
    });
  },
  registerCallbackForNewIssue: function (clientName, contractName, readingRequestCallback) {
    ContractManager.getWeb3Contract(process.env.NETWORK, contractName).then(Contract => {
      Contract.events.NewIssue({ fromBlock: "latest" }, readingRequestCallback);
      Logger.logEvent(clientName, "Started listening for new issues...");
    }).catch(error => {
      Logger.error(error.stack);
    });
  },
  getTaskWithStatus(clientName, event, contract) {
    return new Promise(function (resolve, reject) {
      var { taskID, taskName, productDID, processID } = module.exports.getTaskInfoFromTaskAssignedEvent(event);
      var task = {
        "taskID": taskID,
        "taskName": taskName,
        "productDID": productDID,
        "processID" : processID
      }
      contract.methods.isTaskFinished(taskID).call({}).then(isFinished => {
        if (isFinished) {
          task["isFinished"] = true
          resolve(task);
        } else {
          task["isFinished"] = false
          resolve(task);
        }
        Logger.logEvent(clientName, `New ${taskName} task assigned.`, task);
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
  taskFinished(clientName, contract, machine, taskID){
    contract.methods.finishTask(taskID).send({from:machine, gas: process.env.DEFAULT_GAS}).then( receipt => {
            Logger.logEvent(clientName, `Task ${taskID} finished`, receipt);
    }).catch(error => {
            Logger.error(error.stack);
    });
  },
  taskStarted(clientName, contract, machine, taskID){
    contract.methods.startTask(taskID).send({from:machine, gas: process.env.DEFAULT_GAS}).then( receipt => {
            Logger.logEvent(clientName, `Task ${taskID} started`, receipt);
    }).catch(error => {
            Logger.error(error.stack);
    });
  }
}