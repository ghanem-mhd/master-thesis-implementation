require("dotenv").config()

const mqtt = require("mqtt");

var Logger = require("../../utilities/logger");
var ClientUtils = require("../client-utilities");
var Helper = require("../../utilities/helper");
var ReadingsClient = require("../readings-client");

class MPOClient {

    static TOPIC_MPO_STATE      = "f/i/state/mpo"
    static TOPIC_MPO_ACK        = "fl/mpo/ack"
    static TOPIC_MPO_DO         = "fl/mpo/do"
    static TOPIC_MPO_OPERATIONS = "fl/mpo/operation"

    constructor(){}

    connect(){
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
        this.readingsClient = new ReadingsClient();
        this.readingsClient.connect();
        this.currentTaskID = 0;
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTClose(){
        Logger.info("MPOClient - MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.info("MPOClient - MQTT client connected");
        this.mqttClient.subscribe(MPOClient.TOPIC_MPO_ACK, {qos: 0});
        this.mqttClient.subscribe(MPOClient.TOPIC_MPO_OPERATIONS, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(MPOClient.TOPIC_MPO_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks("MPOClient", "MPO", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest("MPOClient", "MPO", (error, event) => this.onNewReadingRequest(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        var message = JSON.parse(messageBuffer.toString());

        if (topic == MPOClient.TOPIC_MPO_STATE){
            Logger.info("MPOClient - status: " + messageBuffer.toString());
        }

        if (topic == MPOClient.TOPIC_MPO_ACK){
            Logger.info("MPOClient - Received TOPIC_MPO_ACK message " + JSON.stringify(message));

            var taskID = message["taskID"];
            var code = message["code"];

            if (code == 2){
                Logger.info("MPOClient - finished processing");
                this.Contract.methods.finishTask(taskID).send({from:process.env.MPO, gas: process.env.DEFAULT_GAS}).then( receipt => {
                    Logger.info("MPOClient - Task " + taskID + " is finished");
                    this.currentTaskID = 0;
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }else{
                Logger.info("MPOClient - start processing");
            }
        }

        if (topic == MPOClient.TOPIC_MPO_OPERATIONS){
            Logger.info("MPOClient - Received TOPIC_MPO_OPERATIONS message " + JSON.stringify(message));
            var productID           = message["productID"];
            var operationName       = message["operationName"];
            var operationResult     = message["operationResult"];

            ClientUtils.createCredential(3, productID, operationName, operationResult).then( encodedCredential => {
                ClientUtils.storeCredential("MPOClient", productID, encodedCredential, operationName, operationResult);
            }).catch(error => {
                Logger.error(error.stack);
            });
            try {
                this.Contract.methods.saveProductOperation(productID, Helper.toHex(operationName), operationResult).send({from:process.env.MPO, gas: process.env.DEFAULT_GAS}).then( receipt => {
                    Logger.info("MPOClient - operation has been saved in smart contract");
                });
            } catch (error) {
                Logger.error(error.stack);
            }
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
            ClientUtils.getTask("MPOClient", event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }

                this.currentTaskID = task.taskID;

                if (task.taskName == "Process"){
                    this.handleProcessTask(task);
                }
            });
        }
    }

    async onNewReadingRequest(error, event) {
        if (error){
            Logger.error(error);
        }else{
            var {readingTypeIndex, readingType } = ClientUtils.getReadingType(event);
            var readingValue = this.readingsClient.getRecentReading(readingType);

            this.Contract.methods.saveReadingMPO(this.currentTaskID, readingTypeIndex, readingValue).send({from:process.env.MPO, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("MPOClient - new reading has been saved");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleProcessTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 7);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    sendTask(taskID, taskName, taskMessage,){
        Logger.info("MPOClient - Sending " + taskName + taskID + " " + JSON.stringify(taskMessage));
        this.mqttClient.publish(MPOClient.TOPIC_MPO_DO, JSON.stringify(taskMessage));
    }
}

module.exports = MPOClient