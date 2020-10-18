require("dotenv").config()

const mqtt = require("mqtt");
const Topics = require("../topics");

var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");
var ReadingsClient = require("../readings-client");

class VGRClient{

    static TASK1 = "GetInfo"
    static TASK2 = "DropToHBW"
    static TASK3 = "MoveHBW2MPO"
    static TASK4 = "PickSorted"

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

    onMQTTError(err) {
        Logger.error(err);
        this.mqttClient.end();
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.logEvent(this.clientName, "MQTT client connected");
        this.mqttClient.subscribe(Topics.TOPIC_VGR_ACK, {qos: 0});
        if(process.env.MACHINE_CLIENTS_STATE == true){
            this.mqttClient.subscribe(Topics.TOPIC_VGR_STATE, {qos: 0});
        }
        ClientUtils.registerCallbackForNewTasks(this.clientName, "VGR", (error, event) => this.onNewTask(error, event), (Contract) => {
            this.Contract = Contract;
        });
        ClientUtils.registerCallbackForNewReadingRequest(this.clientName, "VGR", (error, event) => this.onNewReadingRequest(error, event));
    }

    onMQTTMessage(topic, messageBuffer){
        var incomingMessage = JSON.parse(messageBuffer.toString());

        if (topic == Topics.TOPIC_VGR_STATE){
            Logger.logEvent(this.clientName, "Status", incomingMessage);
        }

        if (topic == Topics.TOPIC_VGR_ACK){
            Logger.logEvent(this.clientName, "Received Ack message from HBW", incomingMessage);
            var {taskID, productDID, processID, code } = ClientUtils.getAckMessageInfo(incomingMessage);
            if (code == 3){
                return;
            }
            this.currentTaskID = 0;
            if (code == 1){
                var workpiece   = incomingMessage["workpiece"];
                if (workpiece){
                    this.getInfoTaskFinished(taskID, workpiece["type"], workpiece["id"])
                }
            }else{
                ClientUtils.taskFinished(this.clientName, this.Contract, process.env.VGR, taskID);
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

                if (task.taskName == VGRClient.TASK1){
                    this.handleGetInfoTask(task);
                }

                if (task.taskName == VGRClient.TASK2){
                    this.handleDropToHBWTask(task);
                }

                if (task.taskName == VGRClient.TASK3){
                    this.handleMoveHBW2MPOTask(task);
                }

                if (task.taskName == VGRClient.TASK4){
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
                Logger.logEvent(this.clientName, `New reading has been saved`, receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async handleGetInfoTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 1);
        this.sendTask(task.taskID, task.taskName, taskMessage);
        ClientUtils.taskStarted(this.clientName, this.Contract, process.env.VGR, task.taskID);
    }

    async handleDropToHBWTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 2);
        this.sendTask(task.taskID, task.taskName, taskMessage);
        ClientUtils.taskStarted(this.clientName, this.Contract, process.env.VGR, task.taskID);
    }

    async handleMoveHBW2MPOTask(task){
        var taskMessage = ClientUtils.getTaskMessageObject(task, 5);
        this.sendTask(task.taskID, task.taskName, taskMessage);
        ClientUtils.taskStarted(this.clientName, this.Contract, process.env.VGR, task.taskID);
    }

    async handlePickSortedTask(task){
        ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color"]).then( inputValues => {
            var taskMessage = ClientUtils.getTaskMessageObject(task, 4);
            taskMessage["type"] = inputValues[0];
            this.sendTask(task.taskID, task.taskName, taskMessage);
            ClientUtils.taskStarted(this.clientName, this.Contract, process.env.VGR, task.taskID);
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    sendTask(taskID, taskName, taskMessage){
        Logger.logEvent(this.clientName, `Sending task ${taskName} ${taskID} to VGR`, taskMessage);
        this.mqttClient.publish(Topics.TOPIC_VGR_DO, JSON.stringify(taskMessage));
    }

    getInfoTaskFinished(taskID, color, id){
        this.Contract.methods.finishGetInfoTask(taskID, color, id).send({from:process.env.VGR, gas: process.env.DEFAULT_GAS}).then( receipt => {
            Logger.logEvent(this.clientName, `task ${taskID} finished`, receipt);
            this.currentTaskID = 0;
        }).catch(error => {
            Logger.error(error.stack);
        });
    }
}

module.exports = VGRClient