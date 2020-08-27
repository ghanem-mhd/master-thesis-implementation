require("dotenv").config()

const mqtt = require("mqtt");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");

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

        ContractManager.getWeb3Contract(process.env.NETWORK, "MPO").then( Contract => {
            this.Contract = Contract;
            Logger.info("MPOClient started listening for tasks...");
            this.Contract.events.NewTask({ fromBlock: "latest" }, (error, event) => this.onNewTask(error, event));
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
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("Received TOPIC_MPO_ACK message " + JSON.stringify(message));

            var taskID = message["taskID"];
            var code = message["code"];

            if (code == 2){
                Logger.info("MPO finished processing");
                this.Contract.methods.finishTask(taskID).send({from:process.env.MPO, gas: process.env.DEFAULT_GAS}).then( receipt => {
                    Logger.info("MPO Task " + taskID + " is finished");
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }else{
                Logger.info("MPO start processing");
            }
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productID} = ClientUtils.getTaskInfo(event);
            Logger.info("Start processing " + taskName + " " + taskID + " for product " + productID);

            var isTaskFinished = await this.Contract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("MPO Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("MPO Task " + taskID + " is not finished");
            }

            if (taskName == "StartProcessing"){
                this.handleStartProcessingTask(taskID, taskName, productID);
            }
        }
    }


    async handleStartProcessingTask(taskID, taskName, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")]).then( inputValues => {
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(taskID, taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    sendTask(taskName, taskID, taskMessage,){
        Logger.info("Sending " + taskName + " " + taskID + " to MPO " + JSON.stringify(taskMessage));
        this.mqttClient.publish(MPOClient.TOPIC_MPO_DO, JSON.stringify(taskMessage));
    }
}

module.exports = MPOClient