require("dotenv").config();

const mqtt      = require("mqtt");
const Logger    = require("../utilities/logger");

var FactorySimulator        = require("./factory-simulator");
var HBWClient               = require("./machines/hbw-client");
var VGRClient               = require("./machines/vgr-client");
var SLDClient               = require("./machines/sld-client");
var MPOClient               = require("./machines/mpo-client");
var ReadingClient           = require("./readings-client");
var SupplyingProcessClient  = require("./processes/supplying-client");
var ProductionProcessClient  = require("./processes/production-client");

class MQTTHandler {

    constructor(){}

    connect(){
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
    }

    onMQTTError(error) {
        Logger.error(`Can't connect to MQTT broker ${process.env.CURRENT_MQTT}`)
        Logger.logError(error);
        this.mqttClient.end();
    }

    onMQTTConnect(){
        var simulator                   = new FactorySimulator();
        var hbwClient                   = new HBWClient();
        var vgrClient                   = new VGRClient();
        var sldClient                   = new SLDClient();
        var mpoClient                   = new MPOClient();
        var readingClient               = new ReadingClient();
        var supplyingProcessClient      = new SupplyingProcessClient();
        var productionProcessClient     = new ProductionProcessClient();

        simulator.connect();
        hbwClient.connect();
        vgrClient.connect();
        sldClient.connect();
        mpoClient.connect();
        supplyingProcessClient.connect();
        productionProcessClient.connect();
    }
}

module.exports = MQTTHandler