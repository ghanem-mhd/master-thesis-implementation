require("dotenv").config();

var ContractManager = require("../utilities/contracts-manager");
var Helper = require("../utilities/helper");
var Logger = require("../utilities/logger");

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
    return {readingTypeIndex, readingType};
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
          Logger.info(clientName + " - New task " + taskName + taskID + " is not finished.");
          task["isFinished"] = false
          resolve(task);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
}