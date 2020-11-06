require("dotenv").config();

const mqtt = require("mqtt");
const Topics = require("../topics");
const ContractManager = require("../../utilities/contracts-manager");
const ProviderManager = require("../../utilities/providers-manager");
const Logger = require("../../utilities/logger");
const Helper = require("../../utilities/helper");
const ClientUtils = require("../client-utilities");
const ReadingsClient = require("../readings-client");

class SLDClient {
  static SORTING_TASK_NAME = "Sorting";

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
      process.env.SLD_PK
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
    this.mqttClient.subscribe(Topics.TOPIC_SLD_ACK, { qos: 0 });
    if (process.env.MACHINE_CLIENTS_STATE == true) {
      this.mqttClient.subscribe(Topics.TOPIC_SLD_STATE, { qos: 0 });
    }

    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "SLD",
      "TaskAssigned",
      (taskAssignedEvent) => this.onNewTaskAssigned(taskAssignedEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "SLD",
      "NewReading",
      (newReadingEvent) => this.onNewReadingRequest(newReadingEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "SLD",
      "NewAlert",
      (newAlertEvent) => this.onNewAlert(newAlertEvent)
    );
    ClientUtils.registerCallbackForEvent(
      this.clientName,
      "SLD",
      "ProductOperationSaved",
      (productOperationSavedEvent) =>
        this.onProductOperationSaved(productOperationSavedEvent)
    );

    ContractManager.getTruffleContract(this.provider, "SLD").then(
      (Contract) => {
        this.Contract = Contract;
      }
    );
  }

  onMQTTMessage(topic, messageBuffer) {
    var incomingMessage = JSON.parse(messageBuffer.toString());
    if (topic == Topics.TOPIC_SLD_STATE) {
      Logger.logEvent(this.clientName, "Status", incomingMessage);
    }
    if (topic == Topics.TOPIC_SLD_ACK) {
      var {
        taskID,
        productDID,
        processID,
        code,
      } = ClientUtils.getAckMessageInfo(incomingMessage);
      if (code == 2) {
        Logger.logEvent(
          this.clientName,
          "Received Ack message from SLD",
          incomingMessage
        );
        this.currentTaskID = 0;
        var color = incomingMessage["type"];
        this.sortingTaskFinished(taskID, color);
      }
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
        if (task.taskName == SLDClient.SORTING_TASK_NAME) {
          this.handleSortTask(task);
        }
      })
      .catch((error) => {
        Logger.logError(error);
      });
  }

  async onNewReadingRequest(newReadingEvent) {
    var { readingTypeIndex, readingType } = ClientUtils.getReadingType(event);
    var readingValue = this.readingsClient.getRecentReading(readingType);
    this.Contract.saveReadingSLD(
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

  async onNewAlert(newAlertEvent) {
    Logger.logEvent(
      this.clientName,
      `New alert has been saved: ${newAlertEvent.returnValues["reason"]}`,
      null
    );
    this.mqttClient.publish(
      Topics.TOPIC_SLD_S,
      JSON.stringify(ClientUtils.getSoundMessage(2))
    );
  }

  async handleSortTask(task) {
    var taskMessage = ClientUtils.getTaskMessageObject(task, 8);
    this.sendTaskToMachine(task.taskID, task.taskName, taskMessage);
  }

  sendTaskToMachine(taskID, taskName, taskMessage) {
    Logger.logEvent(
      this.clientName,
      `Sending ${taskName} task ${taskID} to SLD`,
      taskMessage
    );
    this.mqttClient.publish(Topics.TOPIC_SLD_DO, JSON.stringify(taskMessage));
  }

  sortingTaskFinished(taskID, color) {
    this.Contract.getTask(taskID)
      .then((task) => {
        this.Contract.finishSorting(taskID, color, {
          from: this.machineAddress,
          gas: process.env.DEFAULT_GAS,
        })
          .then((receipt) => {
            Logger.logEvent(
              this.clientName,
              `Task ${task[1]} ${taskID} is finished`,
              receipt
            );
            this.currentTaskID = 0;
          })
          .catch((error) => {
            Logger.logError(error);
          });
      })
      .catch((error) => {
        Logger.logError(error);
      });
  }

  onProductOperationSaved(productOperationSavedEvent) {
    ClientUtils.createProductOperationCredentials(
      this.clientName,
      productOperationSavedEvent,
      process.env.SLD_ADDRESS,
      process.env.SLD_PK
    );
  }
}

module.exports = SLDClient;
