require("dotenv").config();

const Product = artifacts.require("Product");
const SupplyingProcess = artifacts.require("SupplyingProcess");
const ProductionProcess = artifacts.require("ProductionProcess");
const HBW = artifacts.require("HBW");
const VGR = artifacts.require("VGR");
const MPO = artifacts.require("MPO");
const SLD = artifacts.require("SLD");

module.exports = function (deployer) {
  deployer.then(async () => {
    var deployedProductContract = await deployer.deploy(Product);
    await deployer.deploy(
      SupplyingProcess,
      process.env.MANUFACTURER_ADDRESS,
      deployedProductContract.address
    );
    await deployer.deploy(
      ProductionProcess,
      process.env.MANUFACTURER_ADDRESS,
      deployedProductContract.address
    );
    await deployer.deploy(
      VGR,
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.VGR_ADDRESS,
      deployedProductContract.address
    );
    await deployer.deploy(
      HBW,
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.HBW_ADDRESS,
      deployedProductContract.address
    );
    await deployer.deploy(
      MPO,
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.MPO_ADDRESS,
      deployedProductContract.address
    );
    await deployer.deploy(
      SLD,
      process.env.MACHINE_OWNER_ADDRESS,
      process.env.SLD_ADDRESS,
      deployedProductContract.address
    );
  });
};
