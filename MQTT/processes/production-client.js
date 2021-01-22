require("dotenv").config();

const mqtt = require("mqtt");
const ContractManager = require("../../utilities/contracts-manager");
const ProviderManager = require("../../utilities/providers-manager");
const Logger = require("../../utilities/logger");
const HBWClient = require("../machines/hbw-client");
const VGRClient = require("../machines/vgr-client");
const SLDClient = require("../machines/sld-client");
const MPOClient = require("../machines/mpo-client");
const ClientUtils = require("../client-utilities");
const Wallet = require("ethereumjs-wallet");

class ProductionProcessClient {
  constructor() {}

  connect() {
    this.clientName = "PLPClient";
    this.mqttClient = mqtt.connect(process.env.MQTT_BROKER);
    this.mqttClient.on("error", (error) => this.onMQTTError(error));
    this.mqttClient.on("connect", () => this.onMQTTConnect());
    this.mqttClient.on("close", () => this.onMQTTClose());
    this.mqttClient.on("message", (topic, messageBuffer) =>
      this.onMQTTMessage(topic, messageBuffer)
    );
    this.provider = ProviderManager.getHttpProvider(
      process.env.NETWORK,
      process.env.PROCESS_OWNER_PK
    );
    this.address = this.provider.addresses[0];
  }

  onMQTTError(error) {
    Logger.logError(error, this.clientName);
    this.mqttClient.end();
  }

  onMQTTConnect() {
    Logger.logEvent(this.clientName, "MQTT client connected");

    ContractManager.getTruffleContract(this.provider, "ProductionProcess")
      .then((contract) => {
        this.productionProcessContract = contract;

        ClientUtils.registerCallbackForEvent(
          this.clientName,
          "ProductionProcess",
          "ProcessStarted",
          (processStartedEvent) => this.onProcessStarted(processStartedEvent)
        );

        ClientUtils.registerCallbackForEvent(
          this.clientName,
          "VGR",
          "TaskFinished",
          (taskFinishedEvent) => this.onVGRTaskFinished(taskFinishedEvent)
        );
        ClientUtils.registerCallbackForEvent(
          this.clientName,
          "HBW",
          "TaskFinished",
          (taskFinishedEvent) => this.onHBWTaskFinished(taskFinishedEvent)
        );
        ClientUtils.registerCallbackForEvent(
          this.clientName,
          "SLD",
          "TaskFinished",
          (taskFinishedEvent) => this.onSLDTaskFinished(taskFinishedEvent)
        );
        ClientUtils.registerCallbackForEvent(
          this.clientName,
          "MPO",
          "TaskFinished",
          (taskFinishedEvent) => this.onMPOTaskFinished(taskFinishedEvent)
        );
      })
      .catch((error) => {
        Logger.logError(error, this.clientName);
      });
  }

  onMQTTClose() {
    Logger.logEvent(this.clientName, "MQTT client disconnected");
  }

  async onProcessStarted(processStartedEvent) {
    var processObject = ClientUtils.getProcessInfoFromProcessStartedEvent(
      processStartedEvent
    );
    this.productionProcessContract
      .step1(processObject.processID, {
        from: this.address,
        gas: process.env.DEFAULT_GAS,
      })
      .then((receipt) => {
        Logger.logEvent(
          this.clientName,
          "Production process step 1 started",
          receipt
        );
      })
      .catch((error) => {
        Logger.logError(error, this.clientName);
      });
  }

  async onHBWTaskFinished(taskFinishedEvent) {
    var task = ClientUtils.getTaskInfoFromTaskFinishedEvent(taskFinishedEvent);
    if (task.taskName == HBWClient.TASK4) {
      if (task.status == 3 || task.state == 4) {
        this.finishProcess(task.processID, 2);
        return;
      }
      this.productionProcessContract
        .step2(task.processID, {
          from: this.address,
          gas: process.env.DEFAULT_GAS,
        })
        .then((receipt) => {
          Logger.logEvent(
            this.clientName,
            "Production process step 2 started",
            receipt
          );
        })
        .catch((error) => {
          Logger.logError(error, this.clientName);
        });
    }
  }

  async onVGRTaskFinished(taskFinishedEvent) {
    try {
      var task = ClientUtils.getTaskInfoFromTaskFinishedEvent(
        taskFinishedEvent
      );
      if (task.taskName == VGRClient.TASK3) {
        if (task.status == 3 || task.state == 4) {
          this.finishProcess(task.processID, 2);
          return;
        }
        var receipt = this.productionProcessContract.step3(task.processID, {
          from: this.address,
          gas: process.env.DEFAULT_GAS,
        });
        Logger.logEvent(
          this.clientName,
          "Production process step 3 started",
          receipt
        );
      }
      if (task.taskName == VGRClient.TASK4) {
        this.finishProcess(task.processID, 1);
      }
    } catch (error) {
      Logger.logError(error, this.clientName);
    }
  }

  async onMPOTaskFinished(taskFinishedEvent) {
    var task = ClientUtils.getTaskInfoFromTaskFinishedEvent(taskFinishedEvent);
    if (task.taskName == MPOClient.PROCESSING_TASK_NAME) {
      if (task.status == 3 || task.state == 4) {
        this.finishProcess(task.processID, 2);
        return;
      }
      this.productionProcessContract
        .step4(task.processID, {
          from: this.address,
          gas: process.env.DEFAULT_GAS,
        })
        .then((receipt) => {
          Logger.logEvent(
            this.clientName,
            "Production process step 4 started",
            receipt
          );
        })
        .catch((error) => {
          Logger.logError(error, this.clientName);
        });
    }
  }

  async onSLDTaskFinished(taskFinishedEvent) {
    var task = ClientUtils.getTaskInfoFromTaskFinishedEvent(taskFinishedEvent);
    if (task.taskName == SLDClient.SORTING_TASK_NAME) {
      if (task.status == 3 || task.state == 4) {
        this.finishProcess(task.processID, 2);
        return;
      }
      this.productionProcessContract
        .step5(task.processID, {
          from: this.address,
          gas: process.env.DEFAULT_GAS,
        })
        .then((receipt) => {
          Logger.logEvent(
            this.clientName,
            "Production process step 5 started",
            receipt
          );
        })
        .catch((error) => {
          Logger.logError(error, this.clientName);
        });
    }
  }

  async finishProcess(processID, status) {
    try {
      var receipt = await this.productionProcessContract.finishProcess(
        processID,
        status,
        {
          from: this.address,
          gas: process.env.DEFAULT_GAS,
        }
      );
      Logger.logEvent(
        this.clientName,
        "Production process finished with status " + status,
        receipt
      );
    } catch (error) {
      Logger.logError(error, this.clientName);
    }
  }
}

module.exports = ProductionProcessClient;
