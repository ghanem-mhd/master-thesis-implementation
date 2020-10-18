require("dotenv").config()

const mqtt = require("mqtt");

var ContractManager = require("../../utilities/contracts-manager");
var Logger          = require("../../utilities/logger");
var HBWClient       = require("../machines/hbw-client");
var VGRClient       = require("../machines/vgr-client");
var ClientUtils     = require("../client-utilities");
var Wallet          = require("ethereumjs-wallet");

class SupplyingProcessClient {

    static TOPIC_START = "fl/supplyingProcess/start"

    constructor(){}

    connect(){
        this.clientName = "SLPClient";
        this.mqttClient  = mqtt.connect(process.env.LOCAL_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        Logger.logEvent(this.clientName, "MQTT client connected");

        this.mqttClient.subscribe(SupplyingProcessClient.TOPIC_START, {qos: 0});

        var contractsAsyncGets = [
            ContractManager.getWeb3Contract(process.env.NETWORK, "VGR"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "HBW"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "SupplyingProcess"),
        ];

        Promise.all(contractsAsyncGets).then( contracts => {
            Logger.logEvent(this.clientName, "Start listening for tasks finish events...");
            var VGRContract                 = contracts[0];
            var HBWContract                 = contracts[1];
            this.supplyingProcessContract   = contracts[2];
            VGRContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onVGRTaskFinished(error, event));
            HBWContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onHBWTaskFinished(error, event));
        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == SupplyingProcessClient.TOPIC_START){
            //var productDID = Wallet.default.generate().getAddressString();
            this.supplyingProcessContract.methods.startSupplyingProcess(process.env.DUMMY_PRODUCT).send({from:process.env.MANUFACTURER, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Supplying process started");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onVGRTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productDID, processID} = ClientUtils.getTaskInfoFromTaskAssignedEvent(event);
            if (taskName == VGRClient.TASK1){
                this.supplyingProcessContract.methods.step2(processID).send({from:process.env.MANUFACTURER, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
            if (taskName == VGRClient.TASK2){
                this.supplyingProcessContract.methods.step4(processID).send({from:process.env.MANUFACTURER, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }

    async onHBWTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productDID, processID} = ClientUtils.getTaskInfoFromTaskAssignedEvent(event);
            if (taskName == HBWClient.TASK1){
                this.supplyingProcessContract.methods.step3(processID).send({from:process.env.MANUFACTURER, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}

module.exports = SupplyingProcessClient