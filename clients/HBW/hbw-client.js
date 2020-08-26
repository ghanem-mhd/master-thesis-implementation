require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");

class HBWClient{

    static TOPIC_HBW_STATE = "f/i/state/hbw"
    static TOPIC_HBW_ACK   = "fl/hbw/ack"
    static TOPIC_HBW_DO    = "fl/hbw/do"

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
        Logger.info("HBW MQTT client connected");
        this.mqttClient.subscribe(HBWClient.TOPIC_HBW_ACK, {qos: 0});
        this.mqttClient.subscribe(HBWClient.TOPIC_HBW_STATE, {qos: 0});

        ContractManager.getWeb3Contract(process.env.NETWORK, "HBW").then( HBWContract => {
            this.HBWContract = HBWContract;
            Logger.info("HBWClient started listening for tasks...");
            this.HBWContract.events.NewTask({ fromBlock: "latest" }, (error, event) => this.onNewTask(error, event));
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
            Logger.info("Received TOPIC_HBW_ACK message");

            var message = JSON.parse(messageBuffer.toString());

            console.log(message);

            var taskID = message["taskID"];

            this.HBWContract.methods.finishTask(taskID).send({from:process.env.HBW, gas: process.env.DEFAULT_GAS}).then( receipt => {
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
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await this.HBWContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("HBW Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("HBW Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();
            var workpiece = {state: "RAW"}

            if (taskName == "FetchContainer"){
                var ParamsRequests = [
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({}),
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = paramValues[1];
                    workpiece["type"]           = paramValues[2];
                    taskMessage["workpiece"]    = workpiece;

                    Logger.info("Sending FetchContainer task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "FetchWB"){
                var ParamsRequests = [
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({}),
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("color")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = '';
                    workpiece["type"]           = paramValues[1];
                    taskMessage["workpiece"]    = workpiece;

                    Logger.info("Sending FetchWB task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "StoreContainer"){
                var ParamsRequests = [
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = '';
                    workpiece["type"]           = '';
                    taskMessage["workpiece"]    = workpiece;

                    Logger.info("Sending StoreContainer task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }


            if (taskName == "StoreWB"){
                var ParamsRequests = [
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({}),
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("id")).call({}),
                    this.HBWContract.methods.getTaskParameter(taskID, Helper.toHex("color")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = paramValues[1];
                    workpiece["type"]           = paramValues[2];
                    taskMessage["workpiece"]    = workpiece;

                    Logger.info("Sending StoreWB task " + taskID + " to HBW");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(HBWClient.TOPIC_HBW_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}

module.exports = HBWClient