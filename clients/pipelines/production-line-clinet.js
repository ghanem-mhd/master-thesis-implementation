require("dotenv").config()

const mqtt = require("mqtt");

var ContractManager = require("../../utilities/contracts-manager");
var Logger = require("../../utilities/logger");
var Helper = require('../../utilities/helper');
var HBWClient = require("../HBW/hbw-client");
var VGRClient = require("../VGR/vgr-client");
var SLDClient = require("../SLD/sld-client");
var MPOClient = require("../MPO/mpo-client");
var ClientUtils = require("../client-utilities");

class ProductionLineClient{

    static TOPIC_ORDER = "fl/production/order"

    constructor(){
        this.hbwClient  = new HBWClient();
        this.vgrClient  = new VGRClient();
        this.sldClient  = new SLDClient();
        this.mpoClient  = new MPOClient();
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
        Logger.info("PLPClient - MQTT client connected");

        this.mqttClient.subscribe(ProductionLineClient.TOPIC_ORDER, {qos: 0});

        this.hbwClient.connect();
        this.vgrClient.connect();
        this.sldClient.connect();
        this.mpoClient.connect();

        var contractsAsyncGets = [
            ContractManager.getWeb3Contract(process.env.NETWORK, "VGR"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "HBW"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "SLD"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "MPO"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "ProductionLine"),
        ];

        Promise.all(contractsAsyncGets).then( contracts => {
            Logger.info("PLPClient - start listening for tasks finish events...");

            var VGRContract = contracts[0];
            var HBWContract = contracts[1];
            var SLDContract = contracts[2];
            var MPOContract = contracts[3];
            this.productionLineContract = contracts[4];

            VGRContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onVGRTaskFinished(error, event));
            HBWContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onHBWTaskFinished(error, event));
            SLDContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onSLDTaskFinished(error, event));
            MPOContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onMPOTaskFinished(error, event));

        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.info("PLPClient - MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){
        var message = JSON.parse(messageBuffer.toString());
        if (topic == ProductionLineClient.TOPIC_ORDER){
            var productID = message["productID"];
            var color = message["color"];
            this.productionLineContract.methods.order(productID, color).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("PLPClient - triggered...");
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
            if (taskName == "MoveHBW2MPO"){
                this.productionLineContract.methods.onMoveHBW2MPOFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
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
            if (taskName == "FetchWB"){
                this.productionLineContract.methods.onFetchWBFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
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
            var {taskID, taskName, productID} = ClientUtils.getTaskInfo(event);
            if (taskName == "StartProcessing"){
                this.productionLineContract.methods.onProcessingFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
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
            var {taskID, taskName, productID} = ClientUtils.getTaskInfo(event);
            if (taskName == "Sort"){
                this.productionLineContract.methods.onSortingFinished(productID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
        }
    }
}

var client = new ProductionLineClient();

client.connect();