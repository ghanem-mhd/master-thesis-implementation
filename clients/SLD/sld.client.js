require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../../utilities/providers-manager");
var KeyManager = require("../../utilities/keys-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");

const helper = require('../../utilities/helper')

TOPIC_SLD_STATE = "f/i/state/sld"
TOPIC_SLD_ACK   = "fl/sld/ack"
TOPIC_SLD_DO    = "fl/sld/do"

mqttClient = mqtt.connect(process.env.MQTT_FT);

var SLDContract = null;

var provider    = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
ContractManager.getTruffleContract(provider, "SLD").then(
    (instance) => {
    SLDContract = instance;
});

mqttClient.on("error", (err) => {
    Logger.error(err);
    mqttClient.end();
});

mqttClient.on("connect", () => {
    Logger.info("SLD MQTT client connected");
    mqttClient.subscribe(TOPIC_SLD_ACK, {qos: 0});
    mqttClient.subscribe(TOPIC_SLD_STATE, {qos: 0});
});

mqttClient.on("close", () => {
    Logger.info("SLD MQTT client disconnected");
});

mqttClient.on("message", function (topic, messageBuffer) {

    if (topic == TOPIC_SLD_STATE){
        var message = JSON.parse(messageBuffer.toString());
        Logger.info("SLD status: " + messageBuffer.toString());
    }

    if (topic == TOPIC_SLD_ACK){
        Logger.info("Received TOPIC_SLD_ACK message");
        
        var message = JSON.parse(messageBuffer.toString());

        var taskID = message["taskID"];
        var code = message["code"];

        if (code == 1){
            Logger.info("SLD start sorting");
        }else{
            Logger.info("SLD finished sorting");
            
            var color = message["type"];

            SLDContract.finishSorting(taskID, color,{from:process.env.SLD}).then( receipt => {
                Logger.info("Task " + taskID + " is finished");
            });
        }   
    }
});

ContractManager.getWeb3Contract(process.env.NETWORK, "SLD").then( SLDContract => {
    Logger.info("SLD starting listening for tasks...");
    SLDContract.events.NewTask({ fromBlock: 0}, async function(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await SLDContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();

            if (taskName == "StartSorting"){
                var ParamsRequests = [
                    SLDContract.methods.getTaskParameter(taskID, helper.toHex("code")).call({})
                ];
        
                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["workpiece"]    = null;
    
                    Logger.info("Sending StartSorting task " + taskID + " to SLD");

                    Logger.info(JSON.stringify(taskMessage))

                    mqttClient.publish(TOPIC_SLD_DO, JSON.stringify(taskMessage));
    
                }).catch( error => {
                    Logger.error(error);
                });
            }
        }
    });
}).catch(error => {
    Logger.error(error);
});




