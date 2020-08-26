require("dotenv").config()

const mqtt = require("mqtt");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");
var ClientUtils = require("../client-utilities");


class SLDClient{

    static TOPIC_SLD_STATE = "f/i/state/sld"
    static TOPIC_SLD_ACK   = "fl/sld/ack"
    static TOPIC_SLD_DO    = "fl/sld/do"

    constructor(){
        this.provider = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
    }

    connect(){
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", () => this.onMQTTError());
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.info("SLD MQTT client connected");
        this.mqttClient.subscribe(SLDClient.TOPIC_SLD_ACK, {qos: 0});
        this.mqttClient.subscribe(SLDClient.TOPIC_SLD_STATE, {qos: 0});

        ContractManager.getWeb3Contract(process.env.NETWORK, "SLD").then( Contract => {
            this.Contract = Contract;
            Logger.info("SLDClient started listening for tasks...");
            this.Contract.events.NewTask({ fromBlock: "latest"}, (error, event) => this.onNewTask(error, event));
        });
    }

    onMQTTClose(){
        Logger.info("SLD MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == SLDClient.TOPIC_SLD_STATE){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("SLD status: " + messageBuffer.toString());
        }

        if (topic == SLDClient.TOPIC_SLD_ACK){
            var message = JSON.parse(messageBuffer.toString());
            Logger.info("Received TOPIC_SLD_ACK message " + JSON.stringify(message));

            var taskID = message["taskID"];
            var code = message["code"];

            if (code == 1){
                Logger.info("SLD start sorting");
            }else{
                Logger.info("SLD finished sorting");

                var color = message["type"];

                this.Contract.methods.finishSorting(taskID, color).send({from:process.env.SLD, gas: process.env.DEFAULT_GAS}).then( receipt => {
                    Logger.info("SLD Task " + taskID + " is finished");
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
                Logger.info("SLD Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("SLD Task " + taskID + " is not finished");
            }

            if (taskName == "StartSorting"){
                this.handleStartSortingTask(taskID, productID);
            }
        }
    }

    async handleStartSortingTask(taskID, productID){
        var taskMessage = ClientUtils.getTaskMessageObject(taskID, productID);
        Promise.all([ClientUtils.getTaskInputRequest(this.Contract, taskID, "code")]).then( inputValues => {
            taskMessage["code"] = parseInt(inputValues[0]);
            Logger.info("Sending StartSorting task " + taskID + " to SLD " + JSON.stringify(taskMessage));
            this.mqttClient.publish(SLDClient.TOPIC_SLD_DO, JSON.stringify(taskMessage));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }
}

module.exports = SLDClient