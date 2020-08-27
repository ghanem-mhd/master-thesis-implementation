require("dotenv").config()

const mqtt = require("mqtt");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");


class VGRClient{

    static TOPIC_VGR_STATE = "f/i/state/vgr"
    static TOPIC_VGR_ACK   = "fl/vgr/ack"
    static TOPIC_VGR_DO    = "fl/vgr/do2"

    constructor(){}

    connect(){
        this.mqttClient  = mqtt.connect(process.env.MQTT_FT);
        this.mqttClient.on("error", () => this.onMQTTError());
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
    }

    onMQTTError(err) {
        Logger.error(err);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.info("VGR MQTT client connected");

        this.mqttClient.subscribe(VGRClient.TOPIC_VGR_ACK, {qos: 0});
        //this.mqttClient.subscribe(VGRClient.TOPIC_VGR_STATE, {qos: 0});

        ContractManager.getWeb3Contract(process.env.NETWORK, "VGR").then( Contract => {
            this.Contract = Contract;
            Logger.info("VGRClient started listening for tasks...");
            Contract.events.NewTask({ fromBlock: "latest" }, (error, event) => this.onNewTask(error, event));
        });
    }

    onMQTTClose(){
        Logger.info("VGR MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == VGRClient.TOPIC_VGR_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("VGR status: " + messageBuffer.toString());
        }

        if (topic == VGRClient.TOPIC_VGR_ACK){
            var message = JSON.parse(messageBuffer.toString());

            Logger.info("Received TOPIC_VGR_ACK message " + JSON.stringify(message));

            var taskID      = message["taskID"];
            var code        = message["code"];
        
            if (code == 3){
                return;
            }

            if (code == 1){
                var workpiece   = message["workpiece"];
                if (workpiece){
                    var color = workpiece["type"];
                    var id = workpiece["id"];
                    this.Contract.methods.finishGetInfo(taskID, id, color).send({from:process.env.VGR, gas: process.env.DEFAULT_GAS}).then( receipt => {
                        Logger.info("VGR Task " + taskID + " is finished");
                    }).catch(error => {
                        Logger.error(error.stack);
                    });
                }
            }else{
                this.Contract.methods.finishTask(taskID).send({from:process.env.VGR}).then( receipt => {
                    Logger.info("VGR Task " + taskID + " is finished");
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
            var {taskID, taskName, productID} = ClientUtils.getTaskInfo(event);

            Logger.info("Start processing " + taskName + " " + taskID + " for product " + productID);

            var isTaskFinished = await this.Contract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("Task " + taskID + " is not finished");
            }

            if (taskName == "GetInfo"){
                this.handleGetInfoTask(taskID, taskName, productID);
            }

            if (taskName == "DropToHBW"){
                this.handleDropToHBWTask(taskID, taskName, productID);
            }

            if (taskName == "MoveHBW2MPO"){
                this.handleMoveHBW2MPOTask(taskID, taskName, productID);
            }

            if (taskName == "PickSorted"){
                this.handlePickSortedTask(taskID, taskName, productID);
            }
        }
    }

    async handleGetInfoTask(taskID, taskName, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")]).then( inputValues => {
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(taskName, taskID,taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleDropToHBWTask(taskID, taskName, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")]).then( inputValues => {
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(taskName, taskID,taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handleMoveHBW2MPOTask(taskID, taskName, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")]).then( inputValues => {
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(taskName, taskID,taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    async handlePickSortedTask(taskID, taskName, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "code"),
                ClientUtils.getTaskInputRequest(this.Contract, taskID, "color"),
            ]).then( inputValues => {
                taskMessage["code"] = parseInt(inputValues[0]);
                taskMessage["type"] = inputValues[1];
                this.sendTask(taskName, taskID,taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    sendTask(taskName, taskID, taskMessage,){
        Logger.info("Sending " + taskName + " " + taskID + " to VGR " + JSON.stringify(taskMessage));
        this.mqttClient.publish(VGRClient.TOPIC_VGR_DO, JSON.stringify(taskMessage));
    }
}

module.exports = VGRClient