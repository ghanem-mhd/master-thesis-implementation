require("dotenv").config();

const mqtt = require("mqtt");
const Topics = require("../topics");
const ContractManager = require("../../utilities/contracts-manager");
const ProviderManager = require("../../utilities/providers-manager");
const Logger = require("../../utilities/logger");
const Helper = require("../../utilities/helper");
const ClientUtils = require("../client-utilities");
const ReadingsClient = require("../readings-client");

class MPOClient {
  static PROCESSING_TASK_NAME = "Processing";

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
    this.readingsClient = new ReadingsClient();
    this.currentTaskID = 0;
    this.provider = ProviderManager.getHttpProvider(
      process.env.NETWORK,
      process.env.MPO_PK
    );
    this.machineAddress = this.provider.addresses[0];
    this.IO = require("../../utilities/socket.js").getIO();
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
    this.mqttClient.subscribe(Topics.TOPIC_MPO_ACK, { qos: 0 });
    this.mqttClient.subscribe(Topics.TOPIC_MPO_OPERATIONS, { qos: 0 });
    if (process.env.MACHINE_CLIENTS_STATE) {
      this.mqttClient.subscribe(Topics.TOPIC_MPO_STATE, { qos: 0 });
    }
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "MPO",
      "TaskAssigned",
      (taskAssignedEvent) => this.onNewTaskAssigned(taskAssignedEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "MPO",
      "NewReading",
      (newReadingEvent) => this.onNewReadingRequest(newReadingEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "MPO",
      "ProductOperationSaved",
      (productOperationSavedEvent) =>
        this.onProductOperationSaved(productOperationSavedEvent)
    );
    ContractManager.getTruffleContract(this.provider, "MPO").then(
      (Contract) => {
        this.Contract = Contract;
      }
    );
  }

  onMQTTMessage(topic, messageBuffer) {
    var incomingMessage = JSON.parse(messageBuffer.toString());

    if (topic == Topics.TOPIC_MPO_STATE) {
      Logger.logEvent(this.clientName, "Status", incomingMessage);
    }

    if (topic == Topics.TOPIC_MPO_ACK) {
      Logger.logEvent(
        this.clientName,
        "Received Ack message from MPO",
        incomingMessage
      );
      var {
        taskID,
        productDID,
        processID,
        code,
      } = ClientUtils.getAckMessageInfo(incomingMessage);

      if (code == 3) {
        var operationName = "Melting";
        var temp = this.readingsClient.getRecentReading("t");
        var operationResult = `Melted at ${temp}°C`;
        this.saveProductOperation(
          productDID,
          taskID,
          operationName,
          operationResult
        );
        return;
      }

      if (code == 4) {
        var operationName = "Milling";
        var operationResult = "ISO 1701-2";
        this.saveProductOperation(
          productDID,
          taskID,
          operationName,
          operationResult
        );
        return;
      }

      if (code == 2) {
        this.currentTaskID = 0;
        ClientUtils.sendFinishTaskTransaction(
          this.clientName,
          this.Contract,
          this.machineAddress,
          taskID,
          2
        );
      }
    }
  }

  async saveProductOperation(
    productDID,
    taskID,
    operationName,
    operationResult
  ) {
    try {
      this.Contract.saveProductOperation(
        taskID,
        operationName,
        operationResult,
        { from: this.machineAddress, gas: process.env.DEFAULT_GAS }
      ).then((receipt) => {
        Logger.info("MPOClient - operation has been saved in smart contract");
      });
    } catch (error) {
      Logger.logError(error, this.clientName);
    }
  }

  async onNewTaskAssigned(taskAssignedEvent) {
    ClientUtils.getTaskWithStatus(
      this.clientName,
      this.Contract,
      taskAssignedEvent
    )
      .then((task) => {
        this.sendStartTaskTransaction(taskAssignedEvent);
      })
      .catch((error) => {
        Logger.logError(error, this.clientName);
      });
  }

  async sendStartTaskTransaction(taskAssignedEvent) {
    ClientUtils.sendTaskStartTransaction(
      this.clientName,
      this.Contract,
      this.machineAddress,
      taskAssignedEvent
    )
      .then((task) => {
        this.currentTaskID = task.taskID;
        if (task.taskName == MPOClient.PROCESSING_TASK_NAME) {
          this.handleProcessTask(task);
        }
      })
      .catch((error) => {
        Logger.logError(error, this.clientName);
      });
  }

  async onNewReadingRequest(newReadingEvent) {
    var { readingTypeIndex, readingType } = ClientUtils.getReadingType(
      newReadingEvent
    );
    var readingValue = this.readingsClient.getRecentReading(readingType);
    this.Contract.saveReadingMPO(
      this.currentTaskID,
      readingTypeIndex,
      readingValue,
      {
        from: this.machineAddress,
        gas: process.env.DEFAULT_GAS,
      }
    )
      .then((receipt) => {
        Logger.logEvent(this.clientName, `New reading has been saved`, receipt);
      })
      .catch((error) => {
        Logger.logError(error, this.clientName);
      });
  }

  async handleProcessTask(task) {
    var taskMessage = ClientUtils.getTaskMessageObject(task, 2);
    this.sendTask(task.taskID, task.taskName, taskMessage);
  }

  sendTask(taskID, taskName, taskMessage) {
    Logger.logEvent(
      this.clientName,
      `Sending ${taskName} task ${taskID} to MPO`,
      taskMessage
    );
    this.mqttClient.publish(Topics.TOPIC_MPO_DO, JSON.stringify(taskMessage));
  }

  onProductOperationSaved(productOperationSavedEvent) {
    ClientUtils.createProductOperationCredentials(
      this.clientName,
      productOperationSavedEvent,
      process.env.MPO_ADDRESS,
      process.env.MPO_PK
    );
  }
}

module.exports = MPOClient;
