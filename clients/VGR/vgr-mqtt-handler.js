require('dotenv').config()

const mqtt = require('mqtt');

class VgrMQTTHandler {
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.username =  process.env.MQTT_USERNAME;
    this.password = process.env.MQTT_PASSWORD;
  }

  connect() {
    this.mqttClient = mqtt.connect(this.host);

    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    this.mqttClient.on('connect', () => {
      console.log(`VGR MQTT client connected`);
    });

    this.mqttClient.subscribe('fl/hbw/ack', {qos: 0});

    this.mqttClient.on('message', function (topic, message) {
      Logger.info({
        'topic' : topic,
        'message': JSON.parse(message.toString())
      });
    });

    this.mqttClient.on('close', () => {
      console.log(`VGR MQTT client disconnected`);
    });
  }
}

module.exports = VGRMQTTHandler;