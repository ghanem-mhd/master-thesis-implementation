require("dotenv").config();

const mqtt = require("mqtt");
const Topics = require("../topics");
const ContractManager = require("../../utilities/contracts-manager");
const ProviderManager = require("../../utilities/providers-manager");
const Logger = require("../../utilities/logger");
const Helper = require("../../utilities/helper");
const ClientUtils = require("../client-utilities");
const ReadingsClient = require("../readings-client");

class HBWClient {
  static TASK1 = "FetchContainer";
  static TASK2 = "StoreContainer";
  static TASK3 = "StoreProduct";
  static TASK4 = "FetchProduct";

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
    this.readingsClient = new ReadingsClient();
    this.currentTaskID = 0;
    this.provider = ProviderManager.getHttpProvider(
      process.env.NETWORK,
      process.env.HBW_PK
    );
    this.machineAddress = this.provider.addresses[0];
  }

  onMQTTError(error) {
    Logger.logError(error);
    this.mqttClient.end();
  }

  onMQTTClose() {
    Logger.logEvent(this.clientName, "MQTT client disconnected");
  }

  onMQTTConnect() {
    Logger.logEvent(this.clientName, "MQTT client connected");
    this.mqttClient.subscribe(Topics.TOPIC_HBW_ACK, { qos: 0 });
    if (process.env.MACHINE_CLIENTS_STATE == true) {
      this.mqttClient.subscribe(Topics.TOPIC_HBW_STATE, { qos: 0 });
    }
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "HBW",
      "TaskAssigned",
      (taskAssignedEvent) => this.onNewTaskAssigned(taskAssignedEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "HBW",
      "NewReading",
      (newReadingEvent) => this.onNewReadingRequest(newReadingEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "HBW",
      "ProductOperationSaved",
      (productOperationSavedEvent) =>
        this.onProductOperationSaved(productOperationSavedEvent)
    );
    ContractManager.getTruffleContract(this.provider, "HBW").then(
      (Contract) => {
        this.Contract = Contract;
      }
    );
  }

  onMQTTMessage(topic, messageBuffer) {
    var incomingMessage = JSON.parse(messageBuffer.toString());

    if (topic == Topics.TOPIC_HBW_STATE) {
      Logger.logEvent(this.clientName, "Status", incomingMessage);
    }

    if (topic == Topics.TOPIC_HBW_ACK) {
      Logger.logEvent(
        this.clientName,
        "Received Ack message from HBW",
        incomingMessage
      );
      var {
        taskID,
        productDID,
        processID,
        code,
      } = ClientUtils.getAckMessageInfo(incomingMessage);
      this.currentTaskID = 0;
      ClientUtils.sendFinishTaskTransaction(
        this.clientName,
        this.Contract,
        this.machineAddress,
        taskID
      );
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
        Logger.logError(error);
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

        if (task.taskName == HBWClient.TASK1) {
          this.handleFetchContainerTask(task);
        }

        if (task.taskName == HBWClient.TASK2) {
          this.handleStoreContainerTask(task);
        }

        if (task.taskName == HBWClient.TASK3) {
          this.handleStoreWBTask(task);
        }

        if (task.taskName == HBWClient.TASK4) {
          this.handleFetchWBTask(task);
        }
      })
      .catch((error) => {
        Logger.logError(error);
      });
  }

  async onNewReadingRequest(newReadingEvent) {
    var { readingTypeIndex, readingType } = ClientUtils.getReadingType(
      newReadingEvent
    );
    var readingValue = this.readingsClient.getRecentReading(readingType);
    this.Contract.saveReadingHBW(
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
        Logger.logError(error);
      });
  }

  async handleFetchContainerTask(task) {
    var taskMessage = ClientUtils.getTaskMessageObject(task, 1);
    this.sendTask(task.taskID, task.taskName, taskMessage);
  }

  async handleStoreWBTask(task) {
    ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color", "id"])
      .then((inputValues) => {
        var taskMessage = ClientUtils.getTaskMessageObject(task, 2);
        taskMessage["workpiece"] = {
          type: inputValues[0],
          id: inputValues[1],
          status: "RAW",
        };
        this.sendTask(task.taskID, task.taskName, taskMessage);
      })
      .catch((error) => {
        Logger.logError(error);
      });
  }

  async handleFetchWBTask(task) {
    ClientUtils.getTaskInputs(this.Contract, task.taskID, ["color"])
      .then((inputValues) => {
        var taskMessage = ClientUtils.getTaskMessageObject(task, 3);
        taskMessage["workpiece"] = {
          id: "",
          type: inputValues[0],
          status: "RAW",
        };
        this.sendTask(task.taskID, task.taskName, taskMessage);
      })
      .catch((error) => {
        Logger.logError(error);
      });
  }

  async handleStoreContainerTask(task) {
    var taskMessage = ClientUtils.getTaskMessageObject(task, 4);
    this.sendTask(task.taskID, task.taskName, taskMessage);
  }

  sendTask(taskID, taskName, taskMessage) {
    Logger.logEvent(
      this.clientName,
      `Sending ${taskName} task ${taskID} to HBW`,
      taskMessage
    );
    this.mqttClient.publish(Topics.TOPIC_HBW_DO, JSON.stringify(taskMessage));
  }

  onProductOperationSaved(productOperationSavedEvent) {
    ClientUtils.createProductOperationCredentials(
      this.clientName,
      productOperationSavedEvent,
      process.env.HBW_ADDRESS,
      process.env.HBW_PK
    );
  }
}

module.exports = HBWClient;
