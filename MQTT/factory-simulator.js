require("dotenv").config();

const mqtt = require("mqtt");
const Topics = require("./topics");
var Logger = require("../utilities/logger");
var ClientUtils = require("./client-utilities");

class FactorySimulator {
  static DELAY = 100;
  static ReadingsFreq = 5000;
  static StockFreq = 5000;

  stock = {
    stockItems: [
      {
        location: "A1",
        workpiece: null,
      },
      {
        location: "A2",
        workpiece: null,
      },
      {
        location: "A3",
        workpiece: null,
      },
      {
        location: "B1",
        workpiece: null,
      },
      {
        location: "B2",
        workpiece: null,
      },
      {
        location: "B3",
        workpiece: null,
      },
      {
        location: "C1",
        workpiece: null,
      },
      {
        location: "C2",
        workpiece: null,
      },
      {
        location: "C3",
        workpiece: null,
      },
    ],
  };

  constructor() {}

  connect() {
    this.clientName = this.constructor.name;
    this.mqttClient = mqtt.connect(process.env.MQTT_BROKER);
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());
    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );

    setInterval(
      this.sendEnvironmentSensorReadings.bind(this),
      FactorySimulator.ReadingsFreq
    );
    setInterval(
      this.sendBrightnessSensorReadings.bind(this),
      FactorySimulator.ReadingsFreq
    );
    setInterval(this.sendStock.bind(this), FactorySimulator.StockFreq);
  }

  sendEnvironmentSensorReadings() {
    var newReading = {};
    newReading["ts"] = new Date().toISOString();
    newReading["t"] = this.getRandomFloat(20, 26);
    newReading["rt"] = this.getRandomFloat(20, 26);
    newReading["h"] = this.getRandomFloat(35, 40);
    newReading["p"] = this.getRandomInt(1000, 1200);
    newReading["rh"] = this.getRandomFloat(35, 40);
    newReading["iaq"] = this.getRandomInt(100, 500);
    newReading["aq"] = this.getRandomInt(0, 3);
    newReading["gr"] = this.getRandomInt(15000, 170000);

    this.mqttClient.publish(Topics.TOPIC_BME680, JSON.stringify(newReading));
  }

  sendBrightnessSensorReadings() {
    var newReading = {};
    newReading["ts"] = new Date().toISOString();
    newReading["br"] = this.getRandomInt(0, 60);
    newReading["ldr"] = this.getRandomInt(15000, 170000);
    this.mqttClient.publish(Topics.TOPIC_LDR, JSON.stringify(newReading));
  }

  sendStock() {
    this.stock["ts"] = new Date().toISOString();
    this.mqttClient.publish(Topics.TOPIC_STOCK, JSON.stringify(this.stock));
  }

  storeWorkPiece(workpiece, productDID) {
    for (var i = 0; i < this.stock.stockItems.length; i++) {
      if (this.stock.stockItems[i].workpiece == null) {
        this.stock.stockItems[i].workpiece = workpiece;
        this.stock.stockItems[i].workpiece.product_DID = productDID;
        return true;
      }
    }
    return false;
  }

  fetchWorkPiece(productDID) {
    for (var i = 0; i < this.stock.stockItems.length; i++) {
      if (this.stock.stockItems[i].workpiece != null) {
        if (this.stock.stockItems[i].workpiece.product_DID == productDID) {
          this.stock.stockItems[i].workpiece = null;
          return true;
        }
      }
    }
    return false;
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
    this.mqttClient.subscribe(Topics.TOPIC_SLD_DO, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_MPO_DO, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_HBW_DO, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_VGR_DO, { qos: 0 });
  }

  onMQTTMessage(incomingMessageTopic, messageBuffer) {
    var incomingMessage = JSON.parse(messageBuffer.toString());

    if (incomingMessage.code == 1) {
      return;
    }

    Logger.logEvent(
      this.clientName,
      `Received task for topic: ${incomingMessageTopic}`,
      incomingMessage
    );

    Logger.logEvent(this.clientName, `Task execution started`);

    if (incomingMessageTopic == Topics.TOPIC_SLD_DO) {
      setTimeout(
        () => this.sendSortingAck(incomingMessage, "2"),
        FactorySimulator.DELAY * 2
      );
    }

    if (incomingMessageTopic == Topics.TOPIC_MPO_DO) {
      setTimeout(
        () => this.sendProcessingAck(incomingMessage, "2"),
        FactorySimulator.DELAY * 2
      );
    }

    if (incomingMessageTopic == Topics.TOPIC_HBW_DO) {
      if (incomingMessage.code == 3) {
        // store workpiece
        var stored = this.storeWorkPiece(
          incomingMessage.workpiece,
          incomingMessage.productDID
        );
        if (stored) {
          setTimeout(
            () => this.sendHBWAck(incomingMessage, 2),
            FactorySimulator.DELAY
          );
          return;
        } else {
          setTimeout(
            () => this.sendHBWAck(incomingMessage, 0),
            FactorySimulator.DELAY
          );
          return;
        }
      }

      if (incomingMessage.code == 4) {
        // fetch workpiece
        var fetched = this.fetchWorkPiece(incomingMessage.productDID);
        if (fetched) {
          setTimeout(
            () => this.sendHBWAck(incomingMessage, 7),
            FactorySimulator.DELAY
          );
          return;
        } else {
          setTimeout(
            () => this.sendHBWAck(incomingMessage, 5),
            FactorySimulator.DELAY
          );
          return;
        }
      }

      setTimeout(
        () => this.sendHBWAck(incomingMessage, incomingMessage.code),
        FactorySimulator.DELAY
      );
    }

    if (incomingMessageTopic == Topics.TOPIC_VGR_DO) {
      if (incomingMessage.code == 2) {
        setTimeout(
          () => this.sendGetInfoAck(incomingMessage),
          FactorySimulator.DELAY
        );
      } else {
        setTimeout(
          () => this.sendVGRAck(incomingMessage),
          FactorySimulator.DELAY
        );
      }
    }
  }

  sendSortingAck(incomingMassage, code) {
    var ackTopic = Topics.TOPIC_SLD_ACK;
    var outgoingMessage = incomingMassage;
    outgoingMessage["type"] = "WHITE";
    outgoingMessage["code"] = code;
    Logger.logEvent(
      this.clientName,
      `Sending ack ${code} message to ${ackTopic}`,
      outgoingMessage
    );
    this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
  }

  sendProcessingAck(incomingMassage, code) {
    var ackTopic = Topics.TOPIC_MPO_ACK;
    var outgoingMessage = incomingMassage;
    outgoingMessage["code"] = code;
    Logger.logEvent(
      this.clientName,
      `Sending ack ${code} message to ${ackTopic}`,
      outgoingMessage
    );
    this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
  }

  sendHBWAck(incomingMassage, code) {
    var ackTopic = Topics.TOPIC_HBW_ACK;
    var outgoingMessage = incomingMassage;
    outgoingMessage["code"] = code;
    Logger.logEvent(
      this.clientName,
      `Sending ack message to ${ackTopic}`,
      outgoingMessage
    );
    this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
  }

  sendGetInfoAck(incomingMassage) {
    var ackTopic = Topics.TOPIC_VGR_ACK;
    var outgoingMessage = incomingMassage;
    outgoingMessage["code"] = 1;
    outgoingMessage["workpiece"] = { id: "04963f92186580", type: "WHITE" };
    Logger.logEvent(
      this.clientName,
      `Sending ack message to ${ackTopic}`,
      outgoingMessage
    );
    this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
  }

  sendVGRAck(incomingMassage) {
    var ackTopic = Topics.TOPIC_VGR_ACK;
    var outgoingMessage = incomingMassage;
    Logger.logEvent(
      this.clientName,
      `Sending ack message to ${ackTopic}`,
      outgoingMessage
    );
    this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
}

module.exports = FactorySimulator;
