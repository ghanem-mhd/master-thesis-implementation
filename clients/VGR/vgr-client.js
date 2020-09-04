require("dotenv").config()

const mqtt = require("mqtt");

var Logger = require("../../utilities/logger");
var ClientUtils = require("../client-utilities");
var ReadingsClient = require("../readings-client");

class VGRClient{

    static TOPIC_VGR_STATE = "f/i/state/vgr"
    static TOPIC_VGR_ACK   = "fl/vgr/ack"
    static TOPIC_VGR_DO    = "fl/vgr/do2"

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

    onMQTTError(err) {
        Logger.error(err);
        this.mqttClient.end();
    }

    onMQTTClose(){
        Logger.info("VGRClient - MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.info("VGRClient - MQTT client connected");
        this.mqttClient.subscribe(VGRClient.TOPIC_VGR_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(VGRClient.TOPIC_VGR_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks("VGRClient", "VGR", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest("VGRClient", "VGR", (error, event) => this.onNewReadingRequest(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == VGRClient.TOPIC_VGR_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("VGRClient status: " + messageBuffer.toString());
        }

        if (topic == VGRClient.TOPIC_VGR_ACK){
            var message = JSON.parse(messageBuffer.toString());

            Logger.info("VGRClient - Received TOPIC_VGR_ACK message " + JSON.stringify(message));

            var taskID      = message["taskID"];
            var code        = message["code"];

            this.currentTaskID = 0;

            if (code == 3){
                return;
            }

            if (code == 1){
                var productID  = message["productID"];
                var workpiece   = message["workpiece"];
                if (workpiece){
                    var color = workpiece["type"];
                    var id = workpiece["id"];

                    this.createCredential(productID, "NFCTagReading", id);
                    this.createCredential(productID, "ColorDetection", color);

                    this.Contract.methods.finishGetInfo(taskID, id, color).send({from:process.env.VGR, gas: process.env.DEFAULT_GAS}).then( receipt => {
                        Logger.info("VGRClient - Task " + taskID + " is finished");
                    }).catch(error => {
                        Logger.error(error.stack);
                    });
                }
            }else{
                this.Contract.methods.finishTask(taskID).send({from:process.env.VGR}).then( receipt => {
                    Logger.info("VGRClient - Task " + taskID + " is finished");
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
            ClientUtils.getTask("VGRClient", event, this.Contract).then((task) => {
                if (task.isFinished){
                    return;
                }
                this.currentTaskID = task.taskID;

                if (task.taskName == "GetInfo"){
                    this.handleGetInfoTask(task);
                }

                if (task.taskName == "DropToHBW"){
                    this.handleDropToHBWTask(task);
                }

                if (task.taskName == "MoveHBW2MPO"){
                    this.handleMoveHBW2MPOTask(task);
                }

                if (task.taskName == "PickSorted"){
                    this.handlePickSortedTask(task);
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

            this.Contract.methods.saveReadingVGR(this.currentTaskID, readingTypeIndex, readingValue).send({from:process.env.VGR, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("VGRClient - new reading has been saved");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleGetInfoTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 1);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    async handleDropToHBWTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 2);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    async handleMoveHBW2MPOTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 5);
        this.sendTask(task.taskID, task.taskName, taskMessage);
    }

    async handlePickSortedTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task.taskID, task.productID, 4);
            taskMessage["type"] = inputValues[0];
            this.sendTask(task.taskID, task.taskName, taskMessage);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    sendTask(taskID, taskName, taskMessage){
        Logger.info("VGRClient - Sending " + taskName + taskID + " " + JSON.stringify(taskMessage));
        this.mqttClient.publish(VGRClient.TOPIC_VGR_DO, JSON.stringify(taskMessage));
    }

    async createCredential(productID, operationName, operationResult){
        ClientUtils.createCredential(1, productID, operationName, operationResult).then( encodedCredential => {
            ClientUtils.storeCredential("VGRClient", productID, encodedCredential, operationName, operationResult);
        }).catch(error => {
            Logger.error(error.stack);
        });
    }
}

module.exports = VGRClient