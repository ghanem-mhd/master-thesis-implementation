require("dotenv").config()

const mqtt = require("mqtt");

var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var HBWClient = require("../HBW/hbw-client");
var VGRClient = require("../VGR/vgr-client");
var ClientUtils = require("../client-utilities");
var Wallet      = require("ethereumjs-wallet");

class SupplyingProcessClient{

    static TOPIC_START = "fl/supplyingProcess/start"

    constructor(){
        this.hbwClient  = new HBWClient();
        this.vgrClient  = new VGRClient();
    }

    connect(){
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
        Logger.info("SLPClient - MQTT client connected");

        this.mqttClient.subscribe(SupplyingProcessClient.TOPIC_START, {qos: 0});

        this.hbwClient.connect();
        this.vgrClient.connect();

        var contractsAsyncGets = [
            ContractManager.getWeb3Contract(process.env.NETWORK, "VGR"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "HBW"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "SupplyingProcess"),
        ];

        Promise.all(contractsAsyncGets).then( contracts => {
            Logger.info("SLPClient - start listening for tasks finish events...");

            var VGRContract = contracts[0];
            var HBWContract = contracts[1];
            this.supplyingProcessContract = contracts[2];

            VGRContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onVGRTaskFinished(error, event));
            HBWContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onHBWTaskFinished(error, event));

        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.info("SLPClient - MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        if (topic == SupplyingProcessClient.TOPIC_START){
            var productID = Wallet.default.generate().getAddressString();
            this.supplyingProcessContract.methods.getInfo(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("SLPClient - triggered...");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onVGRTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var {taskID, taskName, productID} = ClientUtils.getTaskInfo(event);

            if (taskName == "GetInfo"){
                this.supplyingProcessContract.methods.getInfoFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {

                }).catch(error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "DropToHBW"){
                this.supplyingProcessContract.methods.dropToHBWFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
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
            var {taskID, taskName, productID} = ClientUtils.getTaskInfo(event);

            if (taskName == "FetchContainer"){
                this.supplyingProcessContract.methods.fetchContainerFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {

                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}

var supplyingProcessContract = new SupplyingProcessClient();

supplyingProcessContract.connect();