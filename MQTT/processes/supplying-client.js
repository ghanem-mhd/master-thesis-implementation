require("dotenv").config()

const mqtt              = require("mqtt");
const ContractManager   = require("../../utilities/contracts-manager");
const ProviderManager   = require("../../utilities/providers-manager");
const Logger            = require("../../utilities/logger");
const HBWClient         = require("../machines/hbw-client");
const VGRClient         = require("../machines/vgr-client");
const ClientUtils       = require("../client-utilities");
const Wallet            = require("ethereumjs-wallet");

class SupplyingProcessClient {

    constructor(){}

    connect(){
        this.clientName = "SLPClient";
        this.mqttClient  = mqtt.connect(process.env.LOCAL_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
        this.provider = ProviderManager.getHttpProvider(process.env.NETWORK, process.env.MANUFACTURER_PK);
        this.address = this.provider.addresses[0];
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.logEvent(this.clientName, "MQTT client connected");
        ContractManager.getTruffleContract(this.provider, "SupplyingProcess").then( contract => {
            this.supplyingProcessContract = contract;
            ClientUtils.registerCallbackForEvent(this.clientName, "VGR", "TaskFinished", (taskFinishedEvent) => this.onVGRTaskFinished(taskFinishedEvent));
            ClientUtils.registerCallbackForEvent(this.clientName, "HBW", "TaskFinished",(taskFinishedEvent) => this.onHBWTaskFinished(taskFinishedEvent));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    async onVGRTaskFinished(taskFinishedEvent){
        var task = ClientUtils.getTaskInfoFromTaskAssignedEvent(taskFinishedEvent);
        if (task.taskName == VGRClient.TASK1){
            this.supplyingProcessContract.step2(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Supplying process step 2 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
        if (task.taskName == VGRClient.TASK2){
            this.supplyingProcessContract.step4(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Supplying process step 4 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onHBWTaskFinished(taskFinishedEvent){
        var task = ClientUtils.getTaskInfoFromTaskAssignedEvent(taskFinishedEvent);
        if (task.taskName == HBWClient.TASK1){
            this.supplyingProcessContract.step3(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Supplying process step 3 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }
}

module.exports = SupplyingProcessClient