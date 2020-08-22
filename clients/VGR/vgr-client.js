require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../../utilities/providers-manager");
var KeyManager = require("../../utilities/keys-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");

const helper = require('../../utilities/helper')

TOPIC_VGR_STATE = "f/i/state/vgr"
TOPIC_VGR_ACK   = "fl/vgr/ack"
TOPIC_VGR_DO    = "fl/vgr/do2"

mqttClient = mqtt.connect(process.env.MQTT_FT);

var VGRContract = null;

var provider    = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
ContractManager.getTruffleContract(provider, "VGR").then(
    (instance) => {
    VGRContract = instance;
});

mqttClient.on("error", (err) => {
    Logger.error(err);
    mqttClient.end();
});

mqttClient.on("connect", () => {
    Logger.info("VGR MQTT client connected");
    mqttClient.subscribe(TOPIC_VGR_ACK, {qos: 0});
    //mqttClient.subscribe(TOPIC_VGR_STATE, {qos: 0});
});

mqttClient.on("close", () => {
    Logger.info("VGR MQTT client disconnected");
});

mqttClient.on("message", function (topic, messageBuffer) {

    if (topic == TOPIC_VGR_STATE){
        var message = JSON.parse(messageBuffer.toString());
        Logger.info("VGR status: " + messageBuffer.toString());
    }

    if (topic == TOPIC_VGR_ACK){
        Logger.info("Received TOPIC_VGR_ACK message");
        
        var message = JSON.parse(messageBuffer.toString());

        console.log(message)

        var taskID = message["taskID"];
        var code = message["code"];

        VGRContract.finishTask(taskID, {from:process.env.VGR}).then( receipt => {
            Logger.info("Task " + taskID + " is finished");
        });
    }
});

ContractManager.getWeb3Contract(process.env.NETWORK, "VGR").then( VGRContract => {
    Logger.info("VGR starting listening for tasks...");
    VGRContract.events.NewTask({ fromBlock: 0}, async function(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await VGRContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();
            var workpiece = {state: "RAW"}

            if (taskName == "GetInfo"){
                var ParamsRequests = [
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["workpiece"]    = null;
    
                    Logger.info("Sending GetInfo task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_VGR_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    console.log(error);
                });
            }

            if (taskName == "HBWDrop"){
                var ParamsRequests = [
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({}),
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("id")).call({}),
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("color")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = paramValues[1];
                    workpiece["type"]           = paramValues[2];
                    taskMessage["workpiece"]    = workpiece;
    
                    Logger.info("Sending HBWDrop task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_VGR_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    console.log(error);
                });
            }

            if (taskName == "Order"){
                var ParamsRequests = [
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({}),
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("color")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["type"]         = paramValues[1];
                    taskMessage["workpiece"]    = null;
    
                    Logger.info("Sending Order task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_VGR_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    console.log(error);
                });
            }

            if (taskName == "PickSorted"){
                var ParamsRequests = [
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({}),
                    VGRContract.methods.getTaskParameter(taskID, helper.toHex("color")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["type"]         = paramValues[1];
                    taskMessage["workpiece"]    = null;
    
                    Logger.info("Sending PickSorted task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_VGR_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    console.log(error);
                });
            }
        }
    });
}).catch(error => {
    console.log(error);
});




