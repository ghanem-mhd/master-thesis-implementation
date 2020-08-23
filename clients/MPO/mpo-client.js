require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");

class MPOClient{

    static TOPIC_MPO_STATE = "f/i/state/mpo"
    static TOPIC_MPO_ACK   = "fl/mpo/ack"
    static TOPIC_MPO_DO    = "fl/mpo/do"

    constructor(){
        this.provider = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
    }

    connect(){
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", () => this.onMQTTError());
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.info("MPO MQTT client connected");
        this.mqttClient.subscribe(MPOClient.TOPIC_MPO_ACK, {qos: 0});
        this.mqttClient.subscribe(MPOClient.TOPIC_MPO_STATE, {qos: 0});

        ContractManager.getWeb3Contract(process.env.NETWORK, "MPO").then( MPOContract => {
            this.MPOContract = MPOContract;
            Logger.info("MPOClient started listening for tasks...");
            this.MPOContract.events.NewTask({ fromBlock: "latest" }, (error, event) => this.onNewTask(error, event));
        });
    }

    onMQTTClose(){
        Logger.info("MPO MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == MPOClient.TOPIC_MPO_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("MPO status: " + messageBuffer.toString());
        }

        if (topic == MPOClient.TOPIC_MPO_ACK){
            Logger.info("Received TOPIC_MPO_ACK message");

            var message = JSON.parse(messageBuffer.toString());

            var taskID = message["taskID"];
            var code = message["code"];

            console.log(message);

            if (code == 1){
                Logger.info("MPO start processing");
            }else{
                Logger.info("MPO finished processing");
                this.MPOContract.methods.finishTask(taskID).send({from:process.env.MPO, gas: process.env.DEFAULT_GAS}).then( receipt => {
                    Logger.info("MPO Task " + taskID + " is finished");
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await this.MPOContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("MPO Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("MPO Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();

            if (taskName == "StartProcessing"){
                var ParamsRequests = [
                    this.MPOContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["workpiece"]    = null;

                    Logger.info("Sending StartProcessing task " + taskID + " to MPO");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(MPOClient.TOPIC_MPO_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}

module.exports = MPOClient