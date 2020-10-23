require("dotenv").config()

const mqtt                  = require("mqtt");
const Topics                = require("../topics");
const ContractManager       = require("../../utilities/contracts-manager");
const ProviderManager       = require("../../utilities/providers-manager");
const Logger                = require("../../utilities/logger");
const Helper                = require("../../utilities/helper");
const ClientUtils           = require("../client-utilities");
const ReadingsClient        = require("../readings-client");

class MPOClient {

    static PROCESSING_TASK_NAME = "Processing"

    constructor(){}

    connect(){
        this.clientName = this.constructor.name;
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
        this.readingsClient = new ReadingsClient();
        this.readingsClient.connect();
        this.currentTaskID = 0;
        this.provider = ProviderManager.getHttpProvider(process.env.NETWORK, process.env.MPO_PK);
        this.machineAddress = this.provider.addresses[0];
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.logEvent(this.clientName, "MQTT client connected");
        this.mqttClient.subscribe(Topics.TOPIC_MPO_ACK, {qos: 0});
        this.mqttClient.subscribe(Topics.TOPIC_MPO_OPERATIONS, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(Topics.TOPIC_MPO_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks(this.clientName, "MPO", (error, event) => this.onNewTask(error, event));
        ClientUtils.registerCallbackForNewReadingRequest(this.clientName, "MPO", (error, event) => this.onNewReadingRequest(error, event));
        ContractManager.getTruffleContract(this.provider, "MPO").then( Contract => {
            this.Contract = Contract;
        });
    }

    onMQTTMessage(topic, messageBuffer){
        var incomingMessage = JSON.parse(messageBuffer.toString());

        if (topic == Topics.TOPIC_MPO_STATE){
            Logger.logEvent(this.clientName, "Status", incomingMessage);
        }

        if (topic == Topics.TOPIC_MPO_ACK){
            Logger.logEvent(this.clientName, "Received Ack message from MPO", incomingMessage);
            var {taskID, productDID, processID, code } = ClientUtils.getAckMessageInfo(incomingMessage);
            if (code == 2){
                this.currentTaskID = 0;
                ClientUtils.taskFinished(this.clientName, this.Contract, this.machineAddress, taskID);
            }else{
                this.currentTaskID = taskID;
                ClientUtils.taskStarted(this.clientName, this.Contract, this.machineAddress, taskID);
            }
        }

        if (topic == Topics.TOPIC_MPO_OPERATIONS){
            Logger.info("MPOClient - Received TOPIC_MPO_OPERATIONS message " + JSON.stringify(message));
            var productID           = message["productID"];
            var operationName       = message["operationName"];
            var operationResult     = message["operationResult"];

            if (operationName == "Melting"){
                var temp = this.readingsClient.getRecentReading("t");
                operationResult = `Melted at ${temp}°C`
            }

            ClientUtils.createCredential(3, productID, operationName, operationResult).then( encodedCredential => {
                ClientUtils.storeCredential(this.clientName, productID, encodedCredential, operationName, operationResult);
            }).catch(error => {
                Logger.error(error.stack);
            });
            try {
                this.Contract.saveProductOperation(productID, Helper.toHex(operationName), operationResult, {from:this.machineAddress, gas: process.env.DEFAULT_GAS}).then( receipt => {
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
           ClientUtils.getTaskWithStatus(this.clientName, event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }
                this.currentTaskID = task.taskID;
                if (task.taskName == MPOClient.PROCESSING_TASK_NAME){
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
            this.Contract.saveReadingHBW(this.currentTaskID,
                readingTypeIndex,
                readingValue, {
                from:this.machineAddress,
                gas: process.env.DEFAULT_GAS
                }).then( receipt => {
                    Logger.logEvent(this.clientName, `New reading has been saved`, receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleProcessTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 7);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    sendTask(taskID, taskName, taskMessage,){
        Logger.logEvent(this.clientName, `Sending ${taskName} task ${taskID} to MPO`, taskMessage);
        this.mqttClient.publish(Topics.TOPIC_MPO_DO, JSON.stringify(taskMessage));
    }
}

module.exports = MPOClient