require("dotenv").config()

const mqtt = require("mqtt");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");

class VGRClient{

    static TOPIC_VGR_STATE = "f/i/state/vgr"
    static TOPIC_VGR_ACK   = "fl/vgr/ack"
    static TOPIC_VGR_DO    = "fl/vgr/do2"

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

    onMQTTError(err) {
        Logger.error(err);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.info("VGR MQTT client connected");

        this.mqttClient.subscribe(VGRClient.TOPIC_VGR_ACK, {qos: 0});
        this.mqttClient.subscribe(VGRClient.TOPIC_VGR_STATE, {qos: 0});

        ContractManager.getWeb3Contract(process.env.NETWORK, "VGR").then( VGRContract => {
            this.VGRContract = VGRContract;
            Logger.info("VGRClient started listening for tasks...");
            VGRContract.events.NewTask({ fromBlock: 0}, (error, event) => this.onNewTask(error, event));
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
            Logger.info("Received TOPIC_VGR_ACK message");

            var message = JSON.parse(messageBuffer.toString());

            console.log(message)

            var taskID = message["taskID"];
            var code = message["code"];

            this.VGRContract.methods.finishTask(taskID).send({from:process.env.VGR}).then( receipt => {
                Logger.info("Task " + taskID + " is finished");
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

            var isTaskFinished = await this.VGRContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();
            var workpiece = {state: "RAW"}

            if (taskName == "GetInfo"){
                var ParamsRequests = [
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["workpiece"]    = null;

                    Logger.info("Sending GetInfo task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(VGRClient.TOPIC_VGR_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "HBWDrop"){
                var ParamsRequests = [
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({}),
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("id")).call({}),
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("color")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    workpiece["id"]             = paramValues[1];
                    workpiece["type"]           = paramValues[2];
                    taskMessage["workpiece"]    = workpiece;

                    Logger.info("Sending HBWDrop task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(VGRClient.TOPIC_VGR_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "Order"){
                var ParamsRequests = [
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({}),
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("color")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["type"]         = paramValues[1];
                    taskMessage["workpiece"]    = null;

                    Logger.info("Sending Order task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(VGRClient.TOPIC_VGR_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "PickSorted"){
                var ParamsRequests = [
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({}),
                    this.VGRContract.methods.getTaskParameter(taskID, Helper.toHex("color")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["type"]         = paramValues[1];
                    taskMessage["workpiece"]    = null;

                    Logger.info("Sending PickSorted task " + taskID + " to VGR");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(VGRClient.TOPIC_VGR_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}


var vgrClient = new VGRClient();
vgrClient.connect()



