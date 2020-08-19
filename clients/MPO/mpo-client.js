require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../../utilities/providers-manager");
var KeyManager = require("../../utilities/keys-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");

const helper = require('../../utilities/helper')

TOPIC_MPO_STATE = "f/i/state/mpo"
TOPIC_MPO_ACK   = "fl/mpo/ack"
TOPIC_MPO_DO    = "fl/mpo/do"

mqttClient = mqtt.connect(process.env.MQTT_FT);

var MPOContract = null;

var provider    = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
ContractManager.getTruffleContract(provider, "MPO").then(
    (instance) => {
    MPOContract = instance;
});

mqttClient.on("error", (err) => {
    Logger.error(err);
    mqttClient.end();
});

mqttClient.on("connect", () => {
    Logger.info("MPO MQTT client connected");
    mqttClient.subscribe(TOPIC_MPO_ACK, {qos: 0});
    mqttClient.subscribe(TOPIC_MPO_STATE, {qos: 0});
});

mqttClient.on("close", () => {
    Logger.info("MPO MQTT client disconnected");
});

mqttClient.on("message", function (topic, messageBuffer) {

    if (topic == TOPIC_MPO_STATE){
        var message = JSON.parse(messageBuffer.toString());
        Logger.info("MPO status: " + messageBuffer.toString());
    }

    if (topic == TOPIC_MPO_ACK){
        Logger.info("Received TOPIC_MPO_ACK message");

        var message = JSON.parse(messageBuffer.toString());

        var taskID = message["taskID"];
        var code = message["code"];

        if (code == 1){
            Logger.info("MPO start processing");
        }else{
            Logger.info("MPO finished processing");
            MPOContract.finishTask(taskID, {from:process.env.MPO}).then( receipt => {
                Logger.info("Task " + taskID + " is finished");
            });
        }   
    }
});

ContractManager.getWeb3Contract(process.env.NETWORK, "MPO").then( MPOContract => {
    Logger.info("MPO starting listening for tasks...");
    MPOContract.events.NewTask({ fromBlock: 0}, async function(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await MPOContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();

            if (taskName == "StartProcessing"){
                var ParamsRequests = [
                    MPOContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["workpiece"]    = null;
    
                    Logger.info("Sending StartProcessing task " + taskID + " to MPO");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_MPO_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    Logger.error(error);
                });
            }
        }
    });
}).catch(error => {
    Logger.error(error);
});




