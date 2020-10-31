require("dotenv").config()

const mqtt  = require("mqtt");
var Logger  = require("../utilities/logger");

class ReadingsClient {

    static LoggingEnabled       = false;
    static TOPIC_INPUT_BME680   = "i/bme680"
    static TOPIC_INPUT_LDR      = "i/ldr"

    constructor() {
        if (ReadingsClient._instance) {
            return ReadingsClient._instance;
        }
        ReadingsClient._instance = this;
        this.clientName = this.constructor.name;
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));

        this.recentEnvironmentReading = null;
        this.recentBrightnessReading = null;
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTClose(){
        if (ReadingsClient.LoggingEnabled){
            Logger.info("ReadingsClient - MQTT client disconnected");
        }
    }

    onMQTTConnect(){
        if (ReadingsClient.LoggingEnabled){
            Logger.info("ReadingsClient - MQTT client connected");
        }
        this.mqttClient.subscribe(ReadingsClient.TOPIC_INPUT_BME680, {qos: 0});
        this.mqttClient.subscribe(ReadingsClient.TOPIC_INPUT_LDR, {qos: 0});
    }

    onMQTTMessage(topic, messageBuffer){
        var message = JSON.parse(messageBuffer.toString());

        if (ReadingsClient.LoggingEnabled){
            Logger.logEvent(this.clientName, "New reading", message);
        }

        if (topic == ReadingsClient.TOPIC_INPUT_BME680){
            this.recentEnvironmentReading = message;
        }

        if (topic == ReadingsClient.TOPIC_INPUT_LDR){
            this.recentBrightnessReading = message;
        }
    }

    getRecentReading(readingType){
        if (readingType == "br"){
            return parseInt(this.recentBrightnessReading[readingType]);
        }else{
            return parseInt(this.recentEnvironmentReading[readingType]);
        }
    }
}

module.exports = ReadingsClient