require("dotenv").config();

const ContractsManager = require("./contracts-manager");
const ProviderManager = require("./providers-manager");
const Logger = require("./logger");

var processOwnerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.PROCESS_OWNER_PK
);
var productOwnerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.PRODUCT_OWNER_PK
);

var contractsAsyncGets = [
  ContractsManager.getTruffleContract(productOwnerProvider, "Product"),
  ContractsManager.getTruffleContract(
    productOwnerProvider,
    "ProductionProcess"
  ),
  ContractsManager.getTruffleContract(
    processOwnerProvider,
    "ProductionProcess"
  ),
  ContractsManager.getTruffleContract(productOwnerProvider, "SupplyingProcess"),
  ContractsManager.getTruffleContract(processOwnerProvider, "SupplyingProcess"),
];

function finish() {
  process.exit(0);
}

Promise.all(contractsAsyncGets)
  .then(async (contracts) => {
    var clientName = "Task Generator";

    var ProductContract = contracts[0];
    var ProductionContract1 = contracts[1];
    var ProductionContract2 = contracts[2];
    var SupplyingProcess1 = contracts[3];
    var SupplyingProcess2 = contracts[4];

    for (var i = 0; i < process.argv.length; i++) {
      switch (process.argv[i]) {
        case "task":
          switch (process.argv[i + 1]) {
            case "SLD":
              assignSortingTask();
              break;
            case "MPO":
              assignProcessingTask();
              break;
            case "HBW1":
              assignFetchContainerTask();
              break;
            case "HBW2":
              assignStoreProductTask();
              break;
            case "HBW3":
              assignFetchProductTask();
              break;
            case "HBW4":
              assignStoreContainerTask();
              break;
            case "VGR1":
              assignedGetInfoTask();
              break;
            case "VGR2":
              assignedDropToHBWTask();
              break;
            case "VGR3":
              assignedMoveHBW2MPOTask();
              break;
            case "VGR4":
              assignedPickSortedTask();
              break;
          }
          break;
      }
    }

    async function assignSortingTask() {
      try {
        processID = await startProductionProcess();
        receipt = await ProductionContract2.step4(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned sorting task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignProcessingTask() {
      try {
        processID = await startProductionProcess();
        receipt = await ProductionContract2.step3(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned processing task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignFetchContainerTask() {
      try {
        processID = await startSupplyingProcess();
        receipt = await SupplyingProcess2.step2(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned fetch container task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignStoreProductTask() {
      try {
        await ProductContract.saveProductOperation(
          process.env.DUMMY_PRODUCT,
          1,
          "NFCTagReading",
          "12345",
          {
            from: productOwnerProvider.addresses[0],
          }
        );
        await ProductContract.saveProductOperation(
          process.env.DUMMY_PRODUCT,
          1,
          "ColorDetection",
          "RED",
          {
            from: productOwnerProvider.addresses[0],
          }
        );
        processID = await startSupplyingProcess();
        receipt = await SupplyingProcess2.step4(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned store product task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignFetchProductTask() {
      try {
        processID = await startProductionProcess();
        receipt = await ProductionContract2.step1(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned fetch product task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignStoreContainerTask() {
      try {
        processID = await startProductionProcess();
        receipt = await ProductionContract2.step3(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned store container task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignedGetInfoTask() {
      try {
        processID = await startSupplyingProcess();
        receipt = await SupplyingProcess2.step1(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned get info task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignedDropToHBWTask() {
      try {
        processID = await startSupplyingProcess();
        receipt = await SupplyingProcess2.step3(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned drop to hbw task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignedMoveHBW2MPOTask() {
      try {
        processID = await startProductionProcess();
        receipt = await ProductionContract2.step2(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned move to MPO task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function assignedPickSortedTask() {
      try {
        await ProductContract.saveProductOperation(
          process.env.DUMMY_PRODUCT,
          1,
          "Sorting",
          "WHITE",
          {
            from: productOwnerProvider.addresses[0],
          }
        );
        processID = await startProductionProcess();
        receipt = await ProductionContract2.step5(processID, {
          from: processOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "assigned pick sorted task", receipt);
        finish();
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function startProductionProcess(
      productDID = process.env.DUMMY_PRODUCT
    ) {
      try {
        receipt = await ProductionContract1.startProcess(productDID, {
          from: productOwnerProvider.addresses[0],
        });
        Logger.logEvent(clientName, "start production process", receipt);
        processID = parseInt(receipt.logs[0].args[0]);
        return processID;
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }

    async function startSupplyingProcess() {
      try {
        receipt = await SupplyingProcess1.startProcess(
          process.env.DUMMY_PRODUCT,
          {
            from: productOwnerProvider.addresses[0],
          }
        );
        Logger.logEvent(clientName, "start supplying process", receipt);
        processID = parseInt(receipt.logs[0].args[0]);
        return processID;
      } catch (error) {
        Logger.logError(error, clientName);
        finish();
      }
    }
  })
  .catch((error) => {
    Logger.logError(error, "Task Generator");
    process.exit(0);
  });
