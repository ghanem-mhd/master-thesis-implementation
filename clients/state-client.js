require("dotenv").config()

const mqtt = require("mqtt");

var Logger = require("../utilities/logger");

const helper = require('../utilities/helper')

TOPIC_INPUT_STATE_HBW = "f/i/state/hbw"
TOPIC_INPUT_STATE_VGR = "f/i/state/vgr"
TOPIC_INPUT_STATE_MPO = "f/i/state/mpo"
TOPIC_INPUT_STATE_SLD = "f/i/state/sld"
TOPIC_INPUT_STATE_DSI = "f/i/state/dsi"
TOPIC_INPUT_STATE_DSO = "f/i/state/dso"

TOPIC_INPUT_BME680 = "i/bme680"
TOPIC_INPUT_LDR    = "i/ldr"

mqttClient = mqtt.connect(process.env.MQTT_FT);

var HBWContract = null;



mqttClient.on("error", (err) => {
    Logger.error(err);
    mqttClient.end();
});

mqttClient.on("connect", () => {
    Logger.info("State MQTT client connected");
    mqttClient.subscribe(TOPIC_INPUT_STATE_HBW, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_STATE_VGR, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_STATE_MPO, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_STATE_SLD, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_STATE_DSI, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_STATE_DSO, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_BME680, {qos: 0});
    mqttClient.subscribe(TOPIC_INPUT_LDR, {qos: 0});
});

mqttClient.on("close", () => {
    Logger.info("State MQTT client disconnected");
});

mqttClient.on("message", function (topic, messageBuffer) {
    var message = JSON.parse(messageBuffer.toString());
    message["topic"] = topic;
    Logger.info(JSON.stringify(message));
    if(topic == "i/ldr"){
        console.log(message);
    }
    if (topic == "i/bme680"){
        console.log(message);
    }
});



