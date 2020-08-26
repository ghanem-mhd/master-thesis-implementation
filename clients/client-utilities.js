require("dotenv").config();

var Helper = require("../utilities/helper");

module.exports = {
  getTaskInfo: function(event){
    var taskID      = event.returnValues["taskID"];
    var taskName    = event.returnValues["taskName"];
    var productID   = event.returnValues["productID"];
    return {taskID, taskName, productID};
  },
  getTaskInputRequest: function(machineContract, taskID,inputName){
      return machineContract.methods.getTaskInput(taskID, Helper.toHex(inputName)).call({})
  },
  getTaskMessageObject: function(taskID, productID){
    var taskMessage = {}
    taskMessage["productID"]    = String(productID);
    taskMessage["taskID"]       = parseInt(taskID);
    taskMessage["ts"]           = new Date().toISOString();
    return taskMessage;
  }
}