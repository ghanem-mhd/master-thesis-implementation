require("dotenv").config()

const mqtt = require("mqtt");
var Web3 = require("web3");

var ProvidersManager = require("../utilities/providers-manager");
var KeyManager = require("../utilities/keys-manager");
var ContractManager = require("../utilities/contracts-manager");
var Logger = require("../utilities/logger");
var Helper = require('../utilities/helper');
var HBWClient = require("./HBW/hbw-client")
var VGRClient = require("./VGR/vgr-client")

class SupplyLineClient{


    static TOPIC_START = "fl/supplyLine/start"

    constructor(){
        this.provider   = ProvidersManager.getHttpProvider(process.env.NETWORK, process.env.ADMIN_MNEMONIC);
        this.hbwClient  = new HBWClient();
        this.vgrClient  = new VGRClient();
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
        Logger.info("SupplyLine MQTT client connected");

        this.mqttClient.subscribe(SupplyLineClient.TOPIC_START, {qos: 0});

        this.hbwClient.connect();
        this.vgrClient.connect();

        var contractsAsyncGets = [
            ContractManager.getWeb3Contract(process.env.NETWORK, "VGR"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "HBW"),
            ContractManager.getWeb3Contract(process.env.NETWORK, "SupplyLine"),
        ];

        Promise.all(contractsAsyncGets).then( contracts => {
            Logger.info("SupplyLine start listening for tasks finish events...");

            var VGRContract = contracts[0];
            var HBWContract = contracts[1];
            this.supplyLineContract = contracts[2];

            VGRContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onVGRTaskFinished(error, event));
            HBWContract.events.TaskFinished({  fromBlock: "latest" }, (error, event) => this.onHBWTaskFinished(error, event));

        }).catch( error => {
            Logger.error(error.stack);
        });
    }

    onMQTTClose(){
        Logger.info("HBW MQTT client disconnected");
    }

    onMQTTMessage(topic, messageBuffer){

        if (topic == SupplyLineClient.TOPIC_START){
            this.supplyLineContract.methods.getInfo().send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
                Logger.info("SupplyLine started");
            }).catch(error => {
                Logger.error(error.stack);
            });
        }
    }

    async onVGRTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];

            if (taskName == "GetInfo"){
                this.supplyLineContract.methods.getInfoFinished(taskID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {

                }).catch(error => {
                    Logger.error(error.stack);
                });
            }

            if (taskName == "HBWDrop"){
                this.supplyLineContract.methods.hbwDropFinished().send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {
                }).catch(error => {
                    Logger.error(error.stack);
                });
            }
            Logger.info("Supply line - VGR finished a task");
        }
    }

    async onHBWTaskFinished(error, event){
        if (error){
            Logger.error(error);
        }else{
            var taskID      = event.returnValues["taskID"];
            var taskName    = event.returnValues["taskName"];

            if (taskName == "FetchContainer"){
                this.supplyLineContract.methods.fetchContainerFinished(taskID).send({from:process.env.ADMIN, gas: process.env.DEFAULT_GAS}).then( receipt => {

                }).catch(error => {
                    Logger.error(error.stack);
                });
            }

            Logger.info("Supply line - HBW finished a task");
        }
    }
}

var supplyLineContract = new SupplyLineClient();

supplyLineContract.connect();