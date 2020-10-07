require("dotenv").config()

const mqtt = require("mqtt");

var Logger = require("../../utilities/logger");
var ClientUtils = require("../client-utilities");
var ReadingsClient = require("../readings-client");

class HBWClient{

    static TOPIC_HBW_STATE = "f/i/state/hbw"
    static TOPIC_HBW_ACK   = "fl/hbw/ack"
    static TOPIC_HBW_DO    = "fl/hbw/do"

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
        Logger.info("HBWClient - MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.info("HBWClient - MQTT client connected");
        this.mqttClient.subscribe(HBWClient.TOPIC_HBW_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(HBWClient.TOPIC_HBW_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks(this.clientName, "HBW", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest(this.clientName, "HBW", (error, event) => this.onNewReadingRequest(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        var message = JSON.parse(messageBuffer.toString());

        if (topic == HBWClient.TOPIC_HBW_STATE){
            Logger.info("HBWClient status: " + messageBuffer.toString());
        }

        if (topic == HBWClient.TOPIC_HBW_ACK){
            Logger.ClientLog(this.clientName, "Received Ack message from HBW", message);

            var taskID = message["taskID"];

            this.Contract.methods.finishTask(taskID).send({from:process.env.HBW, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.ClientLog(this.clientName, `Finished task ${taskID}`, receipt);
                this.currentTaskID = 0;
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
            ClientUtils.getTask(this.clientName, event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }

                this.currentTaskID = task.taskID;

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


    async onNewReadingRequest(error, event) {
        if (error){
            Logger.error(error);
        }else{
            var {readingTypeIndex, readingType } = ClientUtils.getReadingType(event);
            var readingValue = this.readingsClient.getRecentReading(readingType);

            this.Contract.methods.saveReadingHBW(this.currentTaskID, readingTypeIndex, readingValue).send({from:process.env.HBW, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("HBWClient - new reading has been saved");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleFetchContainerTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 1);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    async handleStoreWBTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color","id"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 2);
            taskMessage["workpiece"] = { type:inputValues[0], id:inputValues[1], status:"RAW" }
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleFetchWBTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 3);
            taskMessage["workpiece"] = { id:"", type:inputValues[0], status:"RAW" }
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleStoreContainerTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 4);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    sendTask(taskID, taskName, taskMessage,){
        Logger.ClientLog(this.clientName, `Sending  task ${taskName} ${taskID} to HBW`, taskMessage);
        this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));
    }
}

module.exports = HBWClient