require("dotenv").config()

const mqtt = require("mqtt");
const Topics = require("../topics");

var ContractManager = require("../../utilities/contracts-manager");

var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");
var ReadingsClient = require("../readings-client");

class SLDClient {

    static SORTING_TASK_NAME = "Sorting"

    constructor(){}

    connect(){
        this.clientName = this.constructor.name;
        this.mqttClient = mqtt.connect(process.env.CURRENT_MQTT);
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
        this.mqttClient.subscribe(Topics.TOPIC_SLD_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(Topics.TOPIC_SLD_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks(this.clientName, "SLD", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest(this.clientName, "SLD", (error, event) => this.onNewReadingRequest(error, event));
        ClientUtils.registerCallbackForNewIssue(this.clientName, "SLD", (error, event) => this.onNewIssue(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        var incomingMessage = JSON.parse(messageBuffer.toString());
        if (topic == Topics.TOPIC_SLD_STATE){
            Logger.logEvent(this.clientName, "Status", incomingMessage);
        }
        if (topic == Topics.TOPIC_SLD_ACK){
            Logger.logEvent(this.clientName, "Received Ack message from SLD", incomingMessage);
            var {taskID, productDID, processID, code } = ClientUtils.getAckMessageInfo(incomingMessage);
            if (code == 2){
                this.currentTaskID = 0;
                var color = incomingMessage["type"];
                this.sortingTaskFinished(taskID, color);
            }else{
                this.currentTaskID = taskID;
                ClientUtils.taskStarted(this.clientName, this.Contract, process.env.SLD, taskID);
            }
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
           ClientUtils.getTaskWithStatus("SLDClient", event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }
                this.currentTaskID = task.taskID;
                if (task.taskName == SLDClient.SORTING_TASK_NAME){
                    this.handleSortTask(task);
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
            this.Contract.methods.saveReadingSLD(this.currentTaskID, readingTypeIndex, readingValue).send({from:process.env.SLD, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, `New reading has been saved`, receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onNewIssue(error, event) {
        if (error){
            Logger.error(error);
        }else{
            Logger.logEvent(this.clientName, `New alert has been saved: ${event.returnValues["reason"]}`, null);
            this.mqttClient.publish(Topics.TOPIC_SLD_S, JSON.stringify(ClientUtils.getSoundMessage(2)));
        }
    }

    async handleSortTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 8);
        this.sendTaskToMachine(task.taskID, task.taskName, taskMessage);
    }

    sendTaskToMachine(taskID, taskName, taskMessage,){
        Logger.logEvent(this.clientName, `Sending ${taskName} task ${taskID} to SLD`, taskMessage);
        this.mqttClient.publish(Topics.TOPIC_SLD_DO, JSON.stringify(taskMessage));
    }

    sortingTaskFinished(taskID, color){
        this.Contract.methods.finishSorting(taskID, color).send({from:process.env.SLD, gas: process.env.DEFAULT_GAS}).then( receipt => {
            Logger.logEvent(this.clientName, `Sorting task ${taskID} finished`, receipt);
            this.currentTaskID = 0;
        }).catch(error => {
            Logger.error(error.stack);
        });
    }
}

module.exports = SLDClient