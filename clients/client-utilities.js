require("dotenv").config();

var ContractManager = require("../utilities/contracts-manager");
var ProvidersManager = require("../utilities/providers-manager");
var Helper = require("../utilities/helper");
var Logger = require("../utilities/logger");
var DB = require("../utilities/db");

var JWT = require("did-jwt");
var Web3 = require('web3');
var ethers = require('ethers');



module.exports = {
  getTaskInfo: function (event) {
    var taskID = event.returnValues["taskID"];
    var taskName = event.returnValues["taskName"];
    var productID = event.returnValues["productID"];
    return { taskID, taskName, productID };
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
  getTaskMessageObject: function (taskID, productID, code) {
    var taskMessage = {}
    taskMessage["productID"] = String(productID);
    taskMessage["taskID"] = parseInt(taskID);
    taskMessage["ts"] = new Date().toISOString();
    taskMessage["code"] = code;
    return taskMessage;
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
      Contract.events.NewTask({ fromBlock: "latest" }, newTasksCallback);
      Logger.info(clientName + " - Started listening for tasks...");
    }).catch(error => {
      Logger.error(clientName + " - Can't connect to the blockchain");
    });
  }, registerCallbackForNewReadingRequest: function (clientName, contractName, readingRequestCallback) {
    ContractManager.getWeb3Contract(process.env.NETWORK, contractName).then(Contract => {
      Contract.events.NewReading({ fromBlock: "latest" }, readingRequestCallback);
      Logger.info(clientName + " - Started listening for reading requests...");
    }).catch(error => {
      Logger.error(clientName + " - Can't connect to the blockchain");
    });
  }, registerCallbackForNewIssue: function (clientName, contractName, readingRequestCallback) {
    ContractManager.getWeb3Contract(process.env.NETWORK, contractName).then(Contract => {
      Contract.events.NewIssue({ fromBlock: "latest" }, readingRequestCallback);
      Logger.info(clientName + " - Started listening for new issues...");
    }).catch(error => {
      Logger.error(clientName + " - Can't connect to the blockchain");
    });
  }, getTask(clientName, event, contract) {
    return new Promise(function (resolve, reject) {
      var { taskID, taskName, productID } = module.exports.getTaskInfo(event);
      var task = {
        "taskID": taskID,
        "taskName": taskName,
        "productID": productID
      }
      contract.methods.isTaskFinished(taskID).call({}).then(isFinished => {
        if (isFinished) {
          Logger.info(clientName + " - " + taskID + " is already finished");
          task["isFinished"] = true
          resolve(task);
        } else {
          Logger.info(clientName + " - New task " + taskName + " " + taskID + " is not finished.");
          task["isFinished"] = false
          resolve(task);
        }
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

    DB.VC.insert(doc,function (error, docs) {
      if (error) {
        Logger.error(error.stack);
      } else {
        Logger.ClientLog(clientName, "Product operation has saved as verifiable credentials", doc);
      }
    });
  }
}