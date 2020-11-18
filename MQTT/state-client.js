require("dotenv").config();
const mqtt = require("mqtt");
var Logger = require("../utilities/logger");
const helper = require("../utilities/helper");

TOPIC_INPUT_STATE_HBW = "f/i/state/hbw";
TOPIC_INPUT_STATE_VGR = "f/i/state/vgr";
TOPIC_INPUT_STATE_MPO = "f/i/state/mpo";
TOPIC_INPUT_STATE_SLD = "f/i/state/sld";
TOPIC_INPUT_STATE_DSI = "f/i/state/dsi";
TOPIC_INPUT_STATE_DSO = "f/i/state/dso";

TOPIC_INPUT_BME680 = "i/bme680";
TOPIC_INPUT_LDR = "i/ldr";

class StateClient {
  constructor() {}

  connect() {
    this.clientName = this.constructor.name;
    this.mqttClient = mqtt.connect(process.env.CURRENT_MQTT);
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());
    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );
  }

  onMQTTError(error) {
    Logger.logError(error, this.clientName);
    this.mqttClient.end();
  }

  onMQTTClose() {
    Logger.logEvent(this.clientName, "MQTT client disconnected");
  }

  onMQTTConnect() {
    Logger.logEvent(this.clientName, "MQTT client connected");
    this.mqttClient.subscribe(TOPIC_INPUT_STATE_HBW, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_STATE_VGR, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_STATE_MPO, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_STATE_SLD, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_STATE_DSI, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_STATE_DSO, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_BME680, { qos: 0 });
    this.mqttClient.subscribe(TOPIC_INPUT_LDR, { qos: 0 });
  }

  onMQTTMessage(topic, messageBuffer) {
    var message = JSON.parse(messageBuffer.toString());
    message["topic"] = topic;
    Logger.info(JSON.stringify(message));
    if (topic == TOPIC_INPUT_LDR) {
      console.log(message);
    }
    if (topic == TOPIC_INPUT_BME680) {
      console.log(message);
    }
  }
}

module.exports = StateClient;
