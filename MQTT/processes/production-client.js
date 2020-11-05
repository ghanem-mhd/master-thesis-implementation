require("dotenv").config()

const mqtt              = require("mqtt");
const ContractManager   = require("../../utilities/contracts-manager");
const ProviderManager   = require("../../utilities/providers-manager");
const Logger            = require("../../utilities/logger");
const HBWClient         = require("../machines/hbw-client");
const VGRClient         = require("../machines/vgr-client");
const SLDClient         = require("../machines/sld-client");
const MPOClient         = require("../machines/mpo-client");
const ClientUtils       = require("../client-utilities");
const Wallet            = require("ethereumjs-wallet");

class ProductionProcessClient {

    //ORDERED
    //IN_PROCESS
    //SHIPPED
    //WAITING_FOR_ORDER

    static TOPIC_ORDER = "f/o/order"
    static TOPIC_ORDER_STATUS = "f/i/order"

    constructor(){}

    connect(){
        this.clientName = "PLPClient";
        this.mqttClient  = mqtt.connect(process.env.LOCAL_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
        this.publishOrderState("WAITING_FOR_ORDER", "");
        this.provider = ProviderManager.getHttpProvider(process.env.NETWORK, process.env.MANUFACTURER_PK);
        this.address = this.provider.addresses[0];
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.logEvent(this.clientName, "MQTT client connected");

        ContractManager.getTruffleContract(this.provider, "ProductionProcess").then( contract => {

            this.productionProcessContract = contract;

            ClientUtils.registerCallbackForEvent(this.clientName, "VGR", "TaskFinished", (taskFinishedEvent) => this.onVGRTaskFinished(taskFinishedEvent));
            ClientUtils.registerCallbackForEvent(this.clientName, "HBW", "TaskFinished",(taskFinishedEvent) => this.onHBWTaskFinished(taskFinishedEvent));
            ClientUtils.registerCallbackForEvent(this.clientName, "SLD", "TaskFinished",(taskFinishedEvent) => this.onSLDTaskFinished(taskFinishedEvent));
            ClientUtils.registerCallbackForEvent(this.clientName, "MPO", "TaskFinished",(taskFinishedEvent) => this.onMPOTaskFinished(taskFinishedEvent));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    async onHBWTaskFinished(taskFinishedEvent){
        var task = ClientUtils.getTaskInfoFromTaskAssignedEvent(taskFinishedEvent);
        if (task.taskName == HBWClient.TASK4){
            this.productionProcessContract.step2(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Production process step 2 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onVGRTaskFinished(taskFinishedEvent){
        var task = ClientUtils.getTaskInfoFromTaskAssignedEvent(taskFinishedEvent);
        if (task.taskName == VGRClient.TASK3){
            this.publishOrderState("IN_PROCESS", this.orderColor);
            this.productionProcessContract.step3(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Production process step 3 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }

        if (task.taskName == VGRClient.TASK4){
            this.publishOrderState("SHIPPED", this.orderColor);
            setTimeout(() => this.publishOrderState("WAITING_FOR_ORDER",""), 5000);
        }
    }

    async onMPOTaskFinished(taskFinishedEvent){
        var task = ClientUtils.getTaskInfoFromTaskAssignedEvent(taskFinishedEvent);
        if (task.taskName == MPOClient.PROCESSING_TASK_NAME){
            this.productionProcessContract.step4(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Production process step 4 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }


    async onSLDTaskFinished(taskFinishedEvent){
        var task = ClientUtils.getTaskInfoFromTaskAssignedEvent(taskFinishedEvent);
        if (task.taskName == SLDClient.SORTING_TASK_NAME){
            this.productionProcessContract.step5(task.processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Production process step 5 started", receipt);
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async publishOrderState(state, color){
        var message = ClientUtils.getOrderStateMessage(state, color);
        this.mqttClient.publish(ProductionProcessClient.TOPIC_ORDER_STATUS, JSON.stringify(message));
    }
}

module.exports = ProductionProcessClient
