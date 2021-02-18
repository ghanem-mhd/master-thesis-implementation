require("dotenv").config();
const mqtt = require("mqtt");
var Logger = require("../utilities/logger");
const helper = require("../utilities/helper");
const Topics = require("./topics");

class StateClient {
  constructor() {}

  connect(app) {
    this.clientName = this.constructor.name;
    this.mqttClient = mqtt.connect(process.env.MQTT_BROKER);
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());
    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );
    this.IO = require("../utilities/socket.js").getIO();

    app.get("/nfc-read", (req, res) => {
      var message = {};
      message["ts"] = new Date().toISOString();
      message["cmd"] = "read";
      this.mqttClient.publish(Topics.TOPIC_NFC_READ, JSON.stringify(message));
      return res.json({});
    });

    app.get("/nfc-delete", (req, res) => {
      var message = {};
      message["ts"] = new Date().toISOString();
      message["cmd"] = "delete";
      this.mqttClient.publish(Topics.TOPIC_NFC_READ, JSON.stringify(message));
      return res.json({});
    });
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
    this.mqttClient.subscribe(Topics.TOPIC_HBW_STATE, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_VGR_STATE, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_MPO_STATE, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_SLD_STATE, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_DSI_STATE, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_DSO_STATE, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_BME680, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_LDR, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_STOCK, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_NFC, { qos: 0 });
  }

  onMQTTMessage(topic, messageBuffer) {
    var message = JSON.parse(messageBuffer.toString());
    if (this.IO) {
      Logger.logEvent(this.clientName, topic, message);
      this.IO.in("data_from_mqtt").emit(topic, message);
    }
  }
}

module.exports = StateClient;
