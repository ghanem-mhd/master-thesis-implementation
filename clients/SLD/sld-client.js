require("dotenv").config()

const mqtt = require("mqtt");

var ProvidersManager = require("../../utilities/providers-manager");
var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require("../../utilities/helper");

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

        ContractManager.getWeb3Contract(process.env.NETWORK, "SLD").then( SLDContract => {
            this.SLDContract = SLDContract;
            Logger.info("SLDClient started listening for tasks...");
            this.SLDContract.events.NewTask({ fromBlock: 0}, (error, event) => this.onNewTask(error, event));
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
            Logger.info("Received TOPIC_SLD_ACK message");

            var message = JSON.parse(messageBuffer.toString());

            var taskID = message["taskID"];
            var code = message["code"];

            console.log(message);

            if (code == 1){
                Logger.info("SLD start sorting");
            }else{
                Logger.info("SLD finished sorting");

                var color = message["type"];

                this.SLDContract.methods.finishSorting(taskID, color).send({from:process.env.SLD, gas: 6721975, gasPrice: '30000000'}).then( receipt => {
                    Logger.info("Task " + taskID + " is finished");
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
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];
            Logger.info("Start processing TaskID " + taskID + " " + taskName);

            var isTaskFinished = await this.SLDContract.methods.isTaskFinished(taskID).call({});

            if (isTaskFinished){
                Logger.info("Task " + taskID + " is already finished");
                return;
            }else{
                Logger.info("Task " + taskID + " is not finished");
            }

            var taskMessage = {}

            taskMessage["taskID"]       = parseInt(taskID);
            taskMessage["ts"]           = new Date().toISOString();

            if (taskName == "StartSorting"){
                var ParamsRequests = [
                    this.SLDContract.methods.getTaskParameter(taskID, Helper.toHex("code")).call({})
                ];

                Promise.all(ParamsRequests).then( paramValues => {
                    taskMessage["code"]         = parseInt(paramValues[0]);
                    taskMessage["workpiece"]    = null;

                    Logger.info("Sending StartSorting task " + taskID + " to SLD");

                    Logger.info(JSON.stringify(taskMessage))

                    this.mqttClient.publish(SLDClient.TOPIC_SLD_DO, JSON.stringify(taskMessage));

                }).catch( error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}

var sldClient = new SLDClient();
sldClient.connect()

