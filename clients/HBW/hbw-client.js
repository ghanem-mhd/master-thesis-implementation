require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../../utilities/providers-manager");
var KeyManager = require("../../utilities/keys-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");

const helper = require('../../utilities/helper')

TOPIC_HBW_STATE = "f/i/state/hbw"
TOPIC_HBW_ACK   = "fl/hbw/ack"
TOPIC_HBW_DO    = "fl/hbw/do"

TOPIC_NFC = "f/i/nfc/ds"

mqttClient = mqtt.connect(process.env.MQTT_FT);

var HBWContract = null;

var provider    = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
ContractManager.getTruffleContract(provider, 'HBW').then(
    (instance) => {
    HBWContract = instance;
});

mqttClient.on("error", (err) => {
    Logger.error(err);
    mqttClient.end();
});

mqttClient.on("connect", () => {
    Logger.info("HBW MQTT client connected");
    mqttClient.subscribe(TOPIC_HBW_ACK, {qos: 0});
    //mqttClient.subscribe(TOPIC_HBW_STATE, {qos: 0});
    mqttClient.subscribe(TOPIC_NFC, {qos: 0});
});

mqttClient.on("close", () => {
    Logger.info("HBW MQTT client disconnected");
});

mqttClient.on("message", function (topic, messageBuffer) {

    if (topic == TOPIC_NFC){
        var message = JSON.parse(messageBuffer.toString());
        Logger.info("NFC: " + messageBuffer.toString());
    }

    if (topic == TOPIC_HBW_STATE){
        var message = JSON.parse(messageBuffer.toString());
        Logger.info("HBW status: " + messageBuffer.toString());
    }

    if (topic == TOPIC_HBW_ACK){
        Logger.info("Received TOPIC_HBW_ACK message");

        var message = JSON.parse(messageBuffer.toString());

        console.log(message);

        var taskID = message["taskID"];

        HBWContract.finishTask(taskID, {from:process.env.HBW}).then( receipt => {
            Logger.info("Task " + taskID + " is finished");
        });
    }
});

ContractManager.getWeb3Contract(process.env.NETWORK, "HBW").then( HBWContract => {
    Logger.info("HBW starting listening for tasks...");
    HBWContract.events.NewTask({ fromBlock: 0}, async function(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await HBWContract.methods.isTaskFinished(taskID).call({});

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

            if (taskName == "FetchContainer"){
                var ParamsRequests = [
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({}),
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("id")).call({}),
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("color")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = paramValues[1];
                    workpiece["type"]           = paramValues[2];
                    taskMessage["workpiece"]    = workpiece;
    
                    Logger.info("Sending FetchContainer task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_HBW_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    Logger.error(error);
                });
            }

            if (taskName == "FetchWB"){
                var ParamsRequests = [
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({}),
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("color")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = '';
                    workpiece["type"]           = paramValues[1];
                    taskMessage["workpiece"]    = workpiece;
    
                    Logger.info("Sending FetchWB task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))
    
                    mqttClient.publish(TOPIC_HBW_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    Logger.error(error);
                });
            }

            if (taskName == "StoreContainer"){
                var ParamsRequests = [
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({})
                ];
    
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = '';
                    workpiece["type"]           = '';
                    taskMessage["workpiece"]    = workpiece;
    
                    Logger.info("Sending StoreContainer task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))
    
                    mqttClient.publish(TOPIC_HBW_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    Logger.error(error);
                });
            }


            if (taskName == "StoreWB"){
                var ParamsRequests = [
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({}),
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("id")).call({}),
                    HBWContract.methods.getTaskParameter(taskID, helper.toHex("color")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = paramValues[1];
                    workpiece["type"]           = paramValues[2];
                    taskMessage["workpiece"]    = workpiece;
    
                    Logger.info("Sending StoreWB task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))
    
                    mqttClient.publish(TOPIC_HBW_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    Logger.error(error);
                });
            }
        }
    });
}).catch(error => {
    Logger.error(error);
});




