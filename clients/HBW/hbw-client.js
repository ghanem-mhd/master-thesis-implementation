require("dotenv").config()

const mqtt = require("mqtt");

var Logger = require("../../utilities/logger");
var ClientUtils = require("../client-utilities");

class HBWClient{

    static TOPIC_HBW_STATE = "f/i/state/hbw"
    static TOPIC_HBW_ACK   = "fl/hbw/ack"
    static TOPIC_HBW_DO    = "fl/hbw/do"

    constructor(){}

    connect(){
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTClose(){
        Logger.info("HBWClient - MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.info("HBWClient - MQTT client connected");
        this.mqttClient.subscribe(HBWClient.TOPIC_HBW_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE){
            this.mqttClient.subscribe(HBWClient.TOPIC_HBW_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks("HBWClient", "HBW", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == HBWClient.TOPIC_HBW_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("HBWClient status: " + messageBuffer.toString());
        }

        if (topic == HBWClient.TOPIC_HBW_ACK){
            var message = JSON.parse(messageBuffer.toString());

            Logger.info("HBWClient - Received TOPIC_HBW_ACK message " + JSON.stringify(message));

            var taskID = message["taskID"];

            this.Contract.methods.finishTask(taskID).send({from:process.env.HBW, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("HBWClient - Task " + taskID + " is finished");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
            ClientUtils.getTask("HBWClient", event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }

                if (task.taskName == "FetchContainer"){
                    this.handleFetchContainerTask(task);
                }

                if (task.taskName == "FetchWB"){
                    this.handleFetchWBTask(task);
                }

                if (task.taskName == "StoreContainer"){
                    this.handleStoreContainerTask(task);
                }

                if (task.taskName == "StoreWB"){
                    this.handleStoreWBTask(task);
                }
            });
        }
    }

    async handleFetchContainerTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["code"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID);
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleFetchWBTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["code", "color"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID);
            taskMessage["code"] = parseInt(inputValues[0]);
            taskMessage["workpiece"] = { id:"", type:inputValues[1], status:"RAW" }
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleStoreContainerTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["code"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID);
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleStoreWBTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["code","color","id"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID);
            taskMessage["code"] = parseInt(inputValues[0]);
            taskMessage["workpiece"] = { type:inputValues[1], id:inputValues[2], status:"RAW" }
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    sendTask(taskID, taskName, taskMessage,){
        Logger.info("HBWClient - Sending " + taskName + taskID + " " + JSON.stringify(taskMessage));
        this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));
    }
}

module.exports = HBWClient