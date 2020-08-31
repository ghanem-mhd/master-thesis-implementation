require("dotenv").config()

const mqtt = require("mqtt");

var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");
var ReadingsClient = require("../readings-client")
class SLDClient{

    static TOPIC_SLD_STATE = "f/i/state/sld"
    static TOPIC_SLD_ACK   = "fl/sld/ack"
    static TOPIC_SLD_DO    = "fl/sld/do"

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
        Logger.info("SLDClient - MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.info("SLDClient - MQTT client connected");
        this.mqttClient.subscribe(SLDClient.TOPIC_SLD_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE){
            this.mqttClient.subscribe(SLDClient.TOPIC_SLD_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks("SLDClient", "SLD", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest("SLDClient", "SLD", (error, event) => this.onNewReadingRequest(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == SLDClient.TOPIC_SLD_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("SLDClient status: " + messageBuffer.toString());
        }

        if (topic == SLDClient.TOPIC_SLD_ACK){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("SLDClient - Received TOPIC_SLD_ACK message " + JSON.stringify(message));
            var taskID = message["taskID"];
            var code = message["code"];
            if (code == 2){
                var color = message["type"];
                this.Contract.methods.finishSorting(taskID, color).send({from:process.env.SLD, gas: process.env.DEFAULT_GAS}).then( receipt => {
                    Logger.info("SLDClient - Task " + taskID + " is finished");
                    this.currentTaskID = 0;
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }else{
                Logger.info("SLDClient - start sorting");
            }
        }
    }

    async onNewTask(error, event){
        if (error){
            Logger.error(error);
        }else{
            ClientUtils.getTask("SLDClient", event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }
                this.currentTaskID = task.taskID;
                if (task.taskName == "Sort"){
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
                Logger.info("SLDClient - new reading has been saved");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleSortTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["code"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID);
            taskMessage["code"] = parseInt(inputValues[0]);
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    sendTask(taskID, taskName, taskMessage,){
        Logger.info("SLDClient - Sending " + taskName + taskID + " " + JSON.stringify(taskMessage));
        this.mqttClient.publish(SLDClient.TOPIC_SLD_DO, JSON.stringify(taskMessage));
    }
}

module.exports = SLDClient