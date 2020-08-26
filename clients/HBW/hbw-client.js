require("dotenv").config()

const mqtt = require("mqtt");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
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

    onMQTTConnect(){
        Logger.info("HBW MQTT client connected");
        this.mqttClient.subscribe(HBWClient.TOPIC_HBW_ACK, {qos: 0});
        this.mqttClient.subscribe(HBWClient.TOPIC_HBW_STATE, {qos: 0});

        ContractManager.getWeb3Contract(process.env.NETWORK, "HBW").then( Contract => {
            this.Contract = Contract;
            Logger.info("HBWClient started listening for tasks...");
            this.Contract.events.NewTask({ fromBlock: "latest" }, (error, event) => this.onNewTask(error, event));
        });
    }

    onMQTTClose(){
        Logger.info("HBW MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == HBWClient.TOPIC_HBW_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("HBW status: " + messageBuffer.toString());
        }

        if (topic == HBWClient.TOPIC_HBW_ACK){
            var message = JSON.parse(messageBuffer.toString());

            Logger.info("Received TOPIC_HBW_ACK message " + JSON.stringify(message));

            var taskID = message["taskID"];

            this.Contract.methods.finishTask(taskID).send({from:process.env.HBW, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("HBW Task " + taskID + " is finished");
            }).catch(error => {
                Logger.error(error.stack);
            });
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
                Logger.info("HBW Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("HBW Task " + taskID + " is not finished");
            }

            if (taskName == "FetchContainer"){
                this.handleFetchContainerTask(taskID, productID);
            }

            if (taskName == "FetchWB"){
                this.handleFetchWBTask(taskID, productID);
            }

            if (taskName == "StoreContainer"){
                this.handleStoreContainerTask(taskID, productID);
            }

            if (taskName == "StoreWB"){
                this.handleStoreWBTask(taskID, productID);
            }
        }
    }

    async handleFetchContainerTask(taskID, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")]).then( inputValues => {
            taskMessage["code"] = parseInt(inputValues[0]);
            Logger.info("Sending FetchContainer task " + taskID + " to HBW " + JSON.stringify(taskMessage));
            this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleFetchWBTask(taskID, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "code"),
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "color"),
            ]).then( inputValues => {
                taskMessage["code"] = parseInt(inputValues[0]);
                taskMessage["workpiece"] = { id:"", type:inputValues[1], status:"RAW" }
                Logger.info("Sending FetchContainer task " + taskID + " to HBW " + JSON.stringify(taskMessage));
                this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleStoreContainerTask(taskID, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")
            ]).then( inputValues => {
                taskMessage["code"] = parseInt(inputValues[0]);
                Logger.info("Sending StoreContainer task " + taskID + " to HBW " + JSON.stringify(taskMessage));
                this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleStoreWBTask(taskID, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "code"),
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "color"),
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "id"),
            ]).then( inputValues => {
                taskMessage["code"] = parseInt(inputValues[0]);
                taskMessage["workpiece"] = { type:inputValues[1], id:inputValues[2], status:"RAW" }
                Logger.info("Sending StoreWB task " + taskID + " to HBW " + JSON.stringify(taskMessage));
                this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }
}

module.exports = HBWClient