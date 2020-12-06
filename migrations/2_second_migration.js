require("dotenv").config();
var Web3 = require("web3");
var ProvidersManager = require("../utilities/providers-manager");
let contractsGasUsed = [];
module.exports = function (deployer) {
  async function customDeploy() {
    var web3 = new Web3(ProvidersManager.getWSProvider(process.env.NETWORK));
    var args = Array.prototype.slice.call(arguments);
    var contractName = args.shift();
    return new Promise(function (resolve, reject) {
      const contract = artifacts.require(contractName);
      deployer.deploy(contract, ...args).then((deployContract) => {
        web3.eth
          .getTransactionReceipt(deployContract.transactionHash)
          .then((receipt) => {
            contractsGasUsed.push({
              contract: contractName,
              gasUsed: receipt.gasUsed,
            });
            resolve(deployContract);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  }

  deployer.then(async () => {
    var deployedProductContract = await customDeploy("Product");
    var deployedRegistryContract = await customDeploy("Registry");
    await customDeploy(
      "SupplyingProcess",
      process.env.PROCESS_OWNER_ADDRESS,
      deployedProductContract.address,
      deployedRegistryContract.address
    );
    await customDeploy(
      "ProductionProcess",
      process.env.PROCESS_OWNER_ADDRESS,
      deployedProductContract.address,
      deployedRegistryContract.address
    );
    await customDeploy(
      "VGR",
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.VGR_ADDRESS,
      deployedProductContract.address,
      deployedRegistryContract.address
    );
    await customDeploy(
      "HBW",
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.HBW_ADDRESS,
      deployedProductContract.address,
      deployedRegistryContract.address
    );
    await customDeploy(
      "MPO",
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.MPO_ADDRESS,
      deployedProductContract.address,
      deployedRegistryContract.address
    );
    await customDeploy(
      "SLD",
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.SLD_ADDRESS,
      deployedProductContract.address,
      deployedRegistryContract.address
    );
    console.log(contractsGasUsed);
  });
};
