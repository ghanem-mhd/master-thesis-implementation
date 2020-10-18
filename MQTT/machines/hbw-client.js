require("dotenv").config()

const mqtt = require("mqtt");
const Topics = require("../topics");

var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");
var ReadingsClient = require("../readings-client");

class HBWClient {

    static TASK1 = "FetchContainer"
    static TASK2 = "StoreContainer"
    static TASK3 = "StoreProduct"
    static TASK4 = "FetchProduct"

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
        this.mqttClient.subscribe(Topics.TOPIC_HBW_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(Topics.TOPIC_HBW_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks(this.clientName, "HBW", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest(this.clientName, "HBW", (error, event) => this.onNewReadingRequest(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        var incomingMessage = JSON.parse(messageBuffer.toString());

        if (topic == Topics.TOPIC_HBW_STATE){
            Logger.logEvent(this.clientName, "Status", incomingMessage);
        }

        if (topic == Topics.TOPIC_HBW_ACK){
            Logger.logEvent(this.clientName, "Received Ack message from HBW", incomingMessage);
            var {taskID, productDID, processID, code } = ClientUtils.getAckMessageInfo(incomingMessage);
            this.currentTaskID = 0;
            ClientUtils.taskFinished(this.clientName, this.Contract, process.env.HBW, taskID);
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

                if (task.taskName == HBWClient.TASK1){
                    this.handleFetchContainerTask(task);
                }

                if (task.taskName == HBWClient.TASK2){
                    this.handleStoreContainerTask(task);
                }

                if (task.taskName == HBWClient.TASK3){
                    this.handleStoreWBTask(task);
                }

                if (task.taskName == HBWClient.TASK4){
                    this.handleFetchWBTask(task);
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
            this.Contract.methods.saveReadingHBW(this.currentTaskID, readingTypeIndex, readingValue).send({from:process.env.HBW, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, `New reading has been saved`, receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleFetchContainerTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 1);
        this.sendTask(task.taskID, task.taskName, taskMessage);
        ClientUtils.taskStarted(this.clientName, this.Contract, process.env.HBW, task.taskID);
    }

    async handleStoreWBTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color","id"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task, 2);
            taskMessage["workpiece"] = { type:inputValues[0], id:inputValues[1], status:"RAW" }
            this.sendTask(task.taskID, task.taskName, taskMessage);
            ClientUtils.taskStarted(this.clientName, this.Contract, process.env.HBW, task.taskID);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleFetchWBTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task, 3);
            taskMessage["workpiece"] = { id:"", type:inputValues[0], status:"RAW" }
            this.sendTask(task.taskID, task.taskName, taskMessage);
            ClientUtils.taskStarted(this.clientName, this.Contract, process.env.HBW, task.taskID);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleStoreContainerTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 4);
        this.sendTask(task.taskID, task.taskName, taskMessage);
        ClientUtils.taskStarted(this.clientName, this.Contract, process.env.HBW, task.taskID);
    }

    sendTask(taskID, taskName, taskMessage){
        Logger.logEvent(this.clientName, `Sending ${taskName} task ${taskID} to HBW`, taskMessage);
        this.mqttClient.publish(Topics.TOPIC_HBW_DO, JSON.stringify(taskMessage));
    }
}

module.exports = HBWClient