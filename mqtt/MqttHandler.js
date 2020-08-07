require('dotenv').config()
const mqtt = require('mqtt');
var Logger = require('../utilities/logger');

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.username =  process.env.MQTT_USERNAME;
    this.password = process.env.MQTT_PASSWORD;
  }
  
  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host);

    // Mqtt error callback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    //this.mqttClient.subscribe('fl/hbw/ack', {qos: 0});

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      Logger.info({
        'topic' : topic,
        'message': JSON.parse(message.toString())
      });
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }
}

module.exports = MqttHandler;