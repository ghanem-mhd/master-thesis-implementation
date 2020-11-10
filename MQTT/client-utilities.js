require("dotenv").config();

const EthrDID = require("ethr-did");
const JWT = require("did-jwt");
const Web3 = require("web3");
const ethers = require("ethers");

const ContractManager = require("../utilities/contracts-manager");
const ProvidersManager = require("../utilities/providers-manager");
const Helper = require("../utilities/helper");
const Logger = require("../utilities/logger");
var DB = require("../utilities/db.js");

module.exports = {
  getTaskInfoFromTaskAssignedEvent: function (event) {
    var task = {};
    task.taskID = event.returnValues["taskID"];
    task.taskName = event.returnValues["taskName"];
    task.productDID = event.returnValues["productDID"];
    task.processID = event.returnValues["processID"];
    task.processContractAddress = event.returnValues["processContractAddress"];
    return task;
  },
  getProductOperationFromEvent: function (event) {
    var productOperation = {};
    productOperation.operationID = event.returnValues["operationID"];
    productOperation.taskID = event.returnValues["taskID"];
    productOperation.productDID = event.returnValues["productDID"];
    productOperation.operationName = event.returnValues["operationName"];
    productOperation.operationResult = event.returnValues["operationResult"];
    return productOperation;
  },
  getReadingType: function (event) {
    var ReadingTypeMapping = ["t", "h", "p", "gr", "br"];
    var readingTypeIndex = event.returnValues["readingType"];
    var readingType = ReadingTypeMapping[readingTypeIndex];
    return { readingTypeIndex, readingType };
  },
  getTaskInputRequest: function (machineContract, taskID, inputName) {
    return machineContract.getTaskInput(taskID, Helper.toHex(inputName));
  },
  getTaskInputs: function (machineContract, taskID, inputsNames) {
    requests = [];
    inputsNames.forEach((inputName) => {
      requests.push(
        module.exports.getTaskInputRequest(machineContract, taskID, inputName)
      );
    });
    return Promise.all(requests);
  },
  registerCallbackForEvent(clientName, contractName, eventName, callback) {
    ContractManager.getWeb3Contract(process.env.NETWORK, contractName)
      .then((Contract) => {
        Contract.events[eventName]({ fromBlock: "latest" }, (error, event) => {
          if (error) {
            Logger.logError(error, clientName);
          } else {
            callback(event);
          }
        });
        Logger.logEvent(
          clientName,
          `Started listening for ${eventName} event in contract ${contractName}`
        );
      })
      .catch((error) => {
        Logger.logError(error, clientName);
      });
  },
  getTaskWithStatus(clientName, contract, taskAssignedEvent) {
    return new Promise(function (resolve, reject) {
      var task = module.exports.getTaskInfoFromTaskAssignedEvent(
        taskAssignedEvent
      );
      contract
        .isTaskFinished(task.taskID)
        .then((isFinished) => {
          if (isFinished) {
            task.isFinished = true;
            resolve(task);
          } else {
            task.isFinished = false;
            resolve(task);
          }
          Logger.logEvent(
            clientName,
            `Task ${task.taskName} ${task.taskID} is assigned`,
            { task: task, taskAssignedEvent: taskAssignedEvent }
          );
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  getOrderStateMessage: function (state, type) {
    var message = {};
    message["type"] = String(type);
    message["state"] = String(state);
    message["ts"] = new Date().toISOString();
    return message;
  },
  getSoundMessage: function (code) {
    var message = {};
    message["code"] = code;
    message["ts"] = new Date().toISOString();
    return message;
  },
  createCredential(keyIndex, productID, operationName, operationResult) {
    var key = ethers.Wallet.fromMnemonic(
      process.env.ADMIN_MNEMONIC,
      "m/44'/60'/0'/0/" + keyIndex
    );
  },
  storeCredential(
    clientName,
    productID,
    encodedCredential,
    operationName,
    operationResult
  ) {
    var doc = {};
    doc["productID"] = "did:ethr:" + productID;
    doc["encodedCredentials"] = encodedCredential;

    doc["operationName"] = operationName;
    doc["operationResult"] = operationResult;
  },
  getTaskMessageObject: function (task, code) {
    var taskMessage = {};
    taskMessage["processID"] = parseInt(task.processID);
    taskMessage["productDID"] = String(task.productDID);
    taskMessage["taskID"] = parseInt(task.taskID);
    taskMessage["ts"] = new Date().toISOString();
    taskMessage["code"] = code;
    return taskMessage;
  },
  getAckMessageInfo(incomingAckMessage) {
    var taskID = incomingAckMessage["taskID"];
    var productDID = incomingAckMessage["productDID"];
    var processID = incomingAckMessage["processID"];
    var code = incomingAckMessage["code"];
    return { taskID, productDID, processID, code };
  },
  sendFinishTaskTransaction(clientName, contract, machineAddress, taskID) {
    contract
      .getTask(taskID)
      .then((task) => {
        contract
          .finishTask(taskID, {
            from: machineAddress,
            gas: process.env.DEFAULT_GAS,
          })
          .then((receipt) => {
            Logger.logEvent(
              clientName,
              `Task ${task[1]} ${taskID} is finished`,
              receipt
            );
          })
          .catch((error) => {
            Logger.logError(error, clientName);
          });
      })
      .catch((error) => {
        Logger.logError(error, clientName);
      });
  },
  sendTaskStartTransaction(
    clientName,
    contract,
    machineAddress,
    taskAssignedEvent
  ) {
    return new Promise(function (resolve, reject) {
      var task = module.exports.getTaskInfoFromTaskAssignedEvent(
        taskAssignedEvent
      );
      contract
        .startTask(task.taskID, {
          from: machineAddress,
          gas: process.env.DEFAULT_GAS,
        })
        .then((receipt) => {
          Logger.logEvent(
            clientName,
            `Task ${task.taskName} ${task.taskID} is started`,
            receipt
          );
          resolve(task);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  createProductOperationCredentials(
    clientName,
    productOperationSavedEvent,
    machineAddress,
    machinePrivateKey
  ) {
    var signer = JWT.SimpleSigner(machinePrivateKey);
    var productOperation = module.exports.getProductOperationFromEvent(
      productOperationSavedEvent
    );
    var productDID = "did:ethr:" + productOperation.productDID;
    var machineDID = "did:ethr:" + machineAddress;
    const vcPayload = {
      sub: productDID,
      vc: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        credentialSubject: {
          productOperation: {
            operationName: productOperation.operationName,
            operationResult: productOperation.operationResult,
            taskID: productOperation.taskID,
            operationID: productOperation.operationID,
          },
        },
      },
    };
    var credentialsDB = DB.getCredentialsDB();
    if (!credentialsDB) {
      DB.init();
      credentialsDB = DB.getCredentialsDB();
    }
    JWT.createJWT(vcPayload, { alg: "ES256K", issuer: machineDID, signer })
      .then((result) => {
        credentialsDB.insert(
          { operationID: productOperation.operationID, vc: result },
          function (err, newDoc) {
            if (err) {
              Logger.error(err);
            } else {
              Logger.logEvent(
                clientName,
                `New verifiable credential created`,
                result
              );
            }
          }
        );
      })
      .catch((error) => {
        Logger.logError(error, clientName);
      });
  },
};
