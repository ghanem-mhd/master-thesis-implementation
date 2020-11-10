require("dotenv").config();

const ContractsManager = require("./contracts-manager");
const ProviderManager = require("./providers-manager");
const Logger = require("./logger");

const transactionOption = {
  from: process.env.MANUFACTURER_ADDRESS,
  gas: process.env.DEFAULT_GAS,
};

var manufacturerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.MANUFACTURER_PK
);
var productOwnerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.PRODUCT_OWNER_PK
);

var contractsAsyncGets = [
  ContractsManager.getTruffleContract(manufacturerProvider, "VGR"),
  ContractsManager.getTruffleContract(manufacturerProvider, "HBW"),
  ContractsManager.getTruffleContract(manufacturerProvider, "MPO"),
  ContractsManager.getTruffleContract(manufacturerProvider, "SLD"),
  ContractsManager.getTruffleContract(productOwnerProvider, "Product"),
];

function finish() {
  process.exit(0);
}

Promise.all(contractsAsyncGets)
  .then(async (contracts) => {
    var VGRContract = contracts[0];
    var HBWContract = contracts[1];
    var MPOContract = contracts[2];
    var SLDContract = contracts[3];
    var ProductContract = contracts[4];

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
              assignStoreContainerTask();
              break;
            case "HBW3":
              assignStoreProductTask();
              break;
            case "HBW4":
              assignFetchProductTask();
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
      await ProductContract.authorizeMachine(
        process.env.SLD_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await SLDContract.assignSortingTask(
        1,
        process.env.DUMMY_PRODUCT,
        transactionOption
      );
      Logger.info("Sorting task assigned " + receipt.tx);
      finish();
    }

    async function assignProcessingTask() {
      await ProductContract.authorizeMachine(
        process.env.MPO_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await MPOContract.assignProcessingTask(
        1,
        process.env.DUMMY_PRODUCT,
        transactionOption
      );
      Logger.info("Processing task assigned " + receipt.tx);
      finish();
    }

    async function assignFetchContainerTask() {
      receipt = await HBWContract.assignFetchContainerTask(
        1,
        transactionOption
      );
      Logger.info("FetchContainer task assigned " + receipt.tx);
      finish();
    }

    async function assignStoreContainerTask() {
      receipt = await HBWContract.assignStoreContainerTask(
        1,
        transactionOption
      );
      Logger.info("FetchContainer task assigned " + receipt.tx);
      finish();
    }

    async function assignStoreProductTask() {
      await ProductContract.authorizeMachine(
        process.env.HBW_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await HBWContract.assignStoreProductTask(
        1,
        process.env.DUMMY_PRODUCT,
        "1",
        "11",
        transactionOption
      );
      Logger.info("FetchContainer task assigned " + receipt.tx);
      finish();
    }

    async function assignFetchProductTask() {
      await ProductContract.authorizeMachine(
        process.env.HBW_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await HBWContract.assignFetchProductTask(
        1,
        process.env.DUMMY_PRODUCT,
        transactionOption
      );
      Logger.info("FetchContainer task assigned " + receipt.tx);
      finish();
    }

    async function assignedGetInfoTask() {
      await ProductContract.authorizeMachine(
        process.env.VGR_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await VGRContract.assignGetInfoTask(
        1,
        process.env.DUMMY_PRODUCT,
        transactionOption
      );
      Logger.info("GetInfo task assigned " + receipt.tx);
      finish();
    }

    async function assignedDropToHBWTask() {
      await ProductContract.authorizeMachine(
        process.env.VGR_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await VGRContract.assignDropToHBWTask(
        1,
        process.env.DUMMY_PRODUCT,
        transactionOption
      );
      Logger.info("DropToHBW task assigned " + receipt.tx);
      finish();
    }

    async function assignedMoveHBW2MPOTask() {
      await ProductContract.authorizeMachine(
        process.env.VGR_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await VGRContract.assignMoveHBW2MPOTask(
        1,
        process.env.DUMMY_PRODUCT,
        transactionOption
      );
      Logger.info("MoveHBW2MPO task assigned " + receipt.tx);
      finish();
    }

    async function assignedPickSortedTask() {
      await ProductContract.authorizeMachine(
        process.env.VGR_ADDRESS,
        process.env.DUMMY_PRODUCT,
        { from: process.env.PRODUCT_OWNER_ADDRESS }
      );
      receipt = await VGRContract.assignPickSortedTask(
        1,
        process.env.DUMMY_PRODUCT,
        "PINK",
        transactionOption
      );
      Logger.info("PickSorted task assigned " + receipt.tx);
      finish();
    }
  })
  .catch((error) => {
    Logger.logError(error, "Task Generator");
    process.exit(0);
  });
