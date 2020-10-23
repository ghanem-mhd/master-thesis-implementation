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

        this.mqttClient.subscribe(ProductionProcessClient.TOPIC_ORDER, {qos: 0});

        var contractsAsyncGets = [
            ContractManager.getWeb3Contract(process.env.NETWORK, "VGR"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "HBW"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "SLD"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "MPO"),
            ContractManager.getTruffleContract(this.provider, "ProductionProcess"),
        ];

        Promise.all(contractsAsyncGets).then( contracts => {
            Logger.logEvent(this.clientName, "Start listening for tasks finish events...");

            var VGRContract = contracts[0];
            var HBWContract = contracts[1];
            var SLDContract = contracts[2];
            var MPOContract = contracts[3];
            this.productionProcessContract = contracts[4];

            VGRContract.events.TaskFinished({ fromBlock: "latest" }, (error, event) => this.onVGRTaskFinished(error, event));
            HBWContract.events.TaskFinished({ fromBlock: "latest" }, (error, event) => this.onHBWTaskFinished(error, event));
            SLDContract.events.TaskFinished({ fromBlock: "latest" }, (error, event) => this.onSLDTaskFinished(error, event));
            MPOContract.events.TaskFinished({ fromBlock: "latest" }, (error, event) => this.onMPOTaskFinished(error, event));

        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        var message = JSON.parse(messageBuffer.toString());
        if (topic == ProductionProcessClient.TOPIC_ORDER){

            this.orderColor     = message["type"];
            var productDID      = process.env.DUMMY_PRODUCT //Wallet.default.generate().getAddressString();
            var color           = message["type"];

            this.publishOrderState("ORDERED", this.orderColor);

            this.productionProcessContract.startProductionProcess(productDID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.logEvent(this.clientName, "Production process started");
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
            if (taskName == VGRClient.TASK3){
                this.publishOrderState("IN_PROCESS", this.orderColor);
                this.productionProcessContract.step3(processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == VGRClient.TASK4){
                this.publishOrderState("SHIPPED", this.orderColor);
                setTimeout(() => this.publishOrderState("WAITING_FOR_ORDER",""), 5000);
            }
        }
    }

    async onHBWTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productDID, processID} = ClientUtils.getTaskInfoFromTaskAssignedEvent(event);
            if (taskName == HBWClient.TASK4){
                this.productionProcessContract.step2(processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }

    async onMPOTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productDID, processID} = ClientUtils.getTaskInfoFromTaskAssignedEvent(event);
            if (taskName == MPOClient.PROCESSING_TASK_NAME){
                this.productionProcessContract.step4(processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }


    async onSLDTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productDID, processID} = ClientUtils.getTaskInfoFromTaskAssignedEvent(event);
            if (taskName == SLDClient.SORTING_TASK_NAME){
                this.productionProcessContract.step5(processID, {from:this.address, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }

    async publishOrderState(state, color){
        var message = ClientUtils.getOrderStateMessage(state, color);
        this.mqttClient.publish(ProductionProcessClient.TOPIC_ORDER_STATUS, JSON.stringify(message));
    }
}

module.exports = ProductionProcessClient
