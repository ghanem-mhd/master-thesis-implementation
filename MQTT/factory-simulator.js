require("dotenv").config()

const mqtt      = require("mqtt");
const Topics    = require("./topics");

var Logger = require("../utilities/logger");
var ClientUtils = require("./client-utilities");

class FactorySimulator {

    static DELAY = 5000

    constructor(){}

    connect(){
        this.clientName = this.constructor.name;
        this.mqttClient  = mqtt.connect(process.env.CURRENT_MQTT);
        this.mqttClient.on("error", (error) => this.onMQTTError(error));
        this.mqttClient.on("connect", () => this.onMQTTConnect());
        this.mqttClient.on("close", () => this.onMQTTClose());
        this.mqttClient.on("message", (topic, messageBuffer) => this.onMQTTMessage(topic, messageBuffer));
    }

    onMQTTError(error) {
        Logger.error(error.stack);
        this.mqttClient.end();
    }

    onMQTTClose(){
        Logger.logEvent(this.clientName, "MQTT client disconnected");
    }

    onMQTTConnect(){
        Logger.logEvent(this.clientName, "MQTT client connected");
        this.mqttClient.subscribe(Topics.TOPIC_SLD_DO, {qos: 0});
        this.mqttClient.subscribe(Topics.TOPIC_MPO_DO, {qos: 0});
        this.mqttClient.subscribe(Topics.TOPIC_HBW_DO, {qos: 0});
        this.mqttClient.subscribe(Topics.TOPIC_VGR_DO, {qos: 0});
    }

    onMQTTMessage(incomingMessageTopic, messageBuffer){
        var incomingMessage = JSON.parse(messageBuffer.toString());

        Logger.logEvent(this.clientName, `Received task for ${incomingMessageTopic}`, incomingMessage);

        if (incomingMessageTopic == Topics.TOPIC_SLD_DO){
            setTimeout(() => this.sendSortingAck(incomingMessage, "1"), FactorySimulator.DELAY);
            setTimeout(() => this.sendSortingAck(incomingMessage, "2"), FactorySimulator.DELAY * 2);
        }

        if (incomingMessageTopic == Topics.TOPIC_MPO_DO){
            setTimeout(() => this.sendProcessingAck(incomingMessage, "1"), FactorySimulator.DELAY);
            setTimeout(() => this.sendProcessingAck(incomingMessage, "2"), FactorySimulator.DELAY * 2);
        }

        if (incomingMessageTopic == Topics.TOPIC_HBW_DO){
            setTimeout(() => this.sendHBWAck(incomingMessage), FactorySimulator.DELAY);
        }

        if (incomingMessageTopic == Topics.TOPIC_VGR_DO){
            if (incomingMessage.code == 1){
                setTimeout(() => this.sendGetInfoAck(incomingMessage), FactorySimulator.DELAY);
            }else{
                setTimeout(() => this.sendVGRAck(incomingMessage), FactorySimulator.DELAY);
            }
        }
    }

    sendSortingAck(incomingMassage, code){
        var ackTopic = Topics.TOPIC_SLD_ACK
        var outgoingMessage = incomingMassage
        outgoingMessage["type"] = "WHITE"
        outgoingMessage["code"] = code
        Logger.logEvent(this.clientName, `Sending ack ${code} message to ${ackTopic}`, outgoingMessage);
        this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
    }

    sendProcessingAck(incomingMassage, code){
        var ackTopic = Topics.TOPIC_MPO_ACK
        var outgoingMessage = incomingMassage
        outgoingMessage["code"] = code
        Logger.logEvent(this.clientName, `Sending ack ${code} message to ${ackTopic}`, outgoingMessage);
        this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
    }

    sendHBWAck(incomingMassage){
        var ackTopic = Topics.TOPIC_HBW_ACK
        var outgoingMessage = incomingMassage
        Logger.logEvent(this.clientName, `Sending ack message to ${ackTopic}`, outgoingMessage);
        this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
    }

    sendGetInfoAck(incomingMassage){
        var ackTopic = Topics.TOPIC_VGR_ACK
        var outgoingMessage = incomingMassage
        outgoingMessage["workpiece"] = {id:"2222", type:"green"}
        Logger.logEvent(this.clientName, `Sending ack message to ${ackTopic}`, outgoingMessage);
        this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
    }

    sendVGRAck(incomingMassage){
        var ackTopic = Topics.TOPIC_VGR_ACK
        var outgoingMessage = incomingMassage
        Logger.logEvent(this.clientName, `Sending ack message to ${ackTopic}`, outgoingMessage);
        this.mqttClient.publish(ackTopic, JSON.stringify(outgoingMessage));
    }
}

module.exports = FactorySimulator