require("dotenv").config();

const Web3 = require("web3");
const ContractsManager = require("../utilities/contracts-manager");
const ProviderManager = require("../utilities/providers-manager");
const Logger = require("../utilities/logger");
const Helper = require("../utilities/helper");
const KeysManager = require("../utilities/keys-manager");

var adminProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.ADMIN_PRIVATE_KEY
);
var productOwnerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.PRODUCT_OWNER_PK
);
var machineOwnerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.MACHINE_OWNER_PK
);

var processOwnerProvider = ProviderManager.getHttpProvider(
  process.env.NETWORK,
  process.env.PROCESS_OWNER_PK
);

var contractsAsyncGets = [
  ContractsManager.getTruffleContract(machineOwnerProvider, "VGR"),
  ContractsManager.getTruffleContract(machineOwnerProvider, "HBW"),
  ContractsManager.getTruffleContract(machineOwnerProvider, "MPO"),
  ContractsManager.getTruffleContract(machineOwnerProvider, "SLD"),
  ContractsManager.getTruffleContract(processOwnerProvider, "SupplyingProcess"),
  ContractsManager.getTruffleContract(
    processOwnerProvider,
    "ProductionProcess"
  ),
  ContractsManager.getTruffleContract(productOwnerProvider, "Product"),
  ContractsManager.getTruffleContract(adminProvider, "Registry"),
];

Promise.all(contractsAsyncGets)
  .then(async (contracts) => {
    var VGRContract = contracts[0];
    var HBWContract = contracts[1];
    var MPOContract = contracts[2];
    var SLDContract = contracts[3];
    var supplyingProcessContract = contracts[4];
    var productionProcessContract = contracts[5];
    var productContract = contracts[6];
    var registryContract = contracts[7];

    try {
      Logger.info("Funding accounts started");
      var web3 = new Web3(adminProvider);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.VGR_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund VGR " + receipt.transactionHash);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.HBW_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund HBW " + receipt.transactionHash);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.MPO_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund MPO " + receipt.transactionHash);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.SLD_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund SLD " + receipt.transactionHash);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.PROCESS_OWNER_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund Process Owner " + receipt.transactionHash);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.PRODUCT_OWNER_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund Product Owner " + receipt.transactionHash);
      receipt = await web3.eth.sendTransaction({
        from: adminProvider.addresses[0],
        to: process.env.MACHINE_OWNER_ADDRESS,
        value: web3.utils.toWei("100", "ether"),
      });
      Logger.info("Fund Machines Owner " + receipt.transactionHash);
    } catch (error) {
      Logger.logError(error, "Seed");
    } finally {
      Logger.info("Funding accounts finished");
    }

    try {
      Logger.info("Products seeding started");
      var mnemonic = String(process.env.PRODUCTS_MNEMONIC).replace(
        /['"]+/g,
        ""
      );
      for (var i = 1; i <= 9; i++) {
        var productAddress = KeysManager.getAddressFromMnemonic(
          mnemonic.toString(),
          i
        );
        receipt = await Helper.sendTransaction(
          productContract.createProduct(productAddress, {
            from: process.env.PRODUCT_OWNER_ADDRESS,
          })
        );
        Logger.info("createProduct" + i + " " + receipt.transactionHash);
      }
    } catch (error) {
      Logger.logError(error, "Seed");
    } finally {
      Logger.info("Product seeding finished");
    }

    try {
      Logger.info("SupplyingProcess seeding started");
      receipt = await Helper.sendTransaction(
        supplyingProcessContract.setMachineAddress(1, VGRContract.address, {
          from: processOwnerProvider.addresses[0],
        })
      );
      Logger.info("setVGRContractAddress " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        supplyingProcessContract.setMachineAddress(2, HBWContract.address, {
          from: processOwnerProvider.addresses[0],
        })
      );
      Logger.info("setHBWContractAddress " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        VGRContract.authorizeProcess(supplyingProcessContract.address, {
          from: machineOwnerProvider.addresses[0],
        })
      );
      Logger.info("authorizeProcess1 " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        HBWContract.authorizeProcess(supplyingProcessContract.address, {
          from: machineOwnerProvider.addresses[0],
        })
      );
      Logger.info("authorizeProcess2 " + receipt.transactionHash);
    } catch (error) {
      Logger.logError(error, "Seed");
    } finally {
      Logger.info("SupplyingProcess seeding finished");
    }

    try {
      Logger.info("ProductionProcess seeding started");
      receipt = await Helper.sendTransaction(
        productionProcessContract.setMachineAddress(1, HBWContract.address, {
          from: processOwnerProvider.addresses[0],
        })
      );
      Logger.info("setHBWContractAddress " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        productionProcessContract.setMachineAddress(2, VGRContract.address, {
          from: processOwnerProvider.addresses[0],
        })
      );
      Logger.info("setVGRContractAddress " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        productionProcessContract.setMachineAddress(3, MPOContract.address, {
          from: processOwnerProvider.addresses[0],
        })
      );
      Logger.info("setMPOContractAddress " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        productionProcessContract.setMachineAddress(4, SLDContract.address, {
          from: processOwnerProvider.addresses[0],
        })
      );
      Logger.info("setSLDContractAddress " + receipt.transactionHash);

      receipt = await Helper.sendTransaction(
        VGRContract.authorizeProcess(productionProcessContract.address, {
          from: machineOwnerProvider.addresses[0],
        })
      );
      Logger.info("authorizeProcess1 " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        HBWContract.authorizeProcess(productionProcessContract.address, {
          from: machineOwnerProvider.addresses[0],
        })
      );
      Logger.info("authorizeProcess2 " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        MPOContract.authorizeProcess(productionProcessContract.address, {
          from: machineOwnerProvider.addresses[0],
        })
      );
      Logger.info("authorizeProcess3 " + receipt.transactionHash);
      receipt = await Helper.sendTransaction(
        SLDContract.authorizeProcess(productionProcessContract.address, {
          from: machineOwnerProvider.addresses[0],
        })
      );
      Logger.info("authorizeProcess4 " + receipt.transactionHash);
    } catch (error) {
      Logger.logError(error, "Seed");
    } finally {
      Logger.info("ProductionProcess seeding finished");
    }

    try {
      var RegistryRequests = [
        { name: "Admin", address: process.env.ADMIN_ADDRESS },
        {
          name: "Fraunhofer FIT - Processes Department",
          address: process.env.PROCESS_OWNER_ADDRESS,
        },
        {
          name: "Fraunhofer FIT - Machines Department",
          address: process.env.MACHINE_OWNER_ADDRESS,
        },
        {
          name: "Fraunhofer FIT - Products Department",
          address: process.env.PRODUCT_OWNER_ADDRESS,
        },
        { name: "High-Bay Warehouse (HBW)", address: process.env.HBW_ADDRESS },
        {
          name: "Vacuum Gripper Robot (VGR)",
          address: process.env.VGR_ADDRESS,
        },
        {
          name: "Multi-Processing Station (MPO)",
          address: process.env.MPO_ADDRESS,
        },
        {
          name: "Sorting Line with Color Detection (SLD)",
          address: process.env.SLD_ADDRESS,
        },
      ];
      for (let i = 0; i < RegistryRequests.length; i++) {
        let name = RegistryRequests[i].name;
        let address = RegistryRequests[i].address;
        let receipt = await Helper.sendTransaction(
          registryContract.registerName(name, address, {
            from: adminProvider.addresses[0],
          })
        );
        Logger.info(`Register ${name} address ` + receipt.transactionHash);
      }
    } catch (error) {
      Logger.logError(error, "Seed");
    } finally {
      Logger.info("Registry seeding finished");
    }

    process.exit(0);
  })
  .catch((error) => {
    Logger.logError(error, "Seed");
    process.exit(0);
  });
