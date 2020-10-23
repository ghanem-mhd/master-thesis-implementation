
require('dotenv').config()

const Product = artifacts.require("Product");
const MockProcess = artifacts.require("MockProcess");
const SupplyingProcess = artifacts.require("SupplyingProcess");
const ProductionProcess = artifacts.require("ProductionProcess");
const MockMachine = artifacts.require("MockMachine");
const HBW = artifacts.require("HBW");
const VGR = artifacts.require("VGR");
const MPO = artifacts.require("MPO");
const SLD = artifacts.require("SLD");

module.exports = function(deployer) {
  deployer.then(async () => {
    var deployedProductContract = await deployer.deploy(Product);
    await deployer.deploy(MockProcess, deployedProductContract.address);
    await deployer.deploy(SupplyingProcess, deployedProductContract.address);
    await deployer.deploy(ProductionProcess, deployedProductContract.address);
    await deployer.deploy(VGR, process.env.ADMIN_ADDRESS, process.env.VGR_ADDRESS, deployedProductContract.address);
    await deployer.deploy(HBW, process.env.ADMIN_ADDRESS, process.env.HBW_ADDRESS, deployedProductContract.address);
    await deployer.deploy(MPO, process.env.ADMIN_ADDRESS, process.env.MPO_ADDRESS, deployedProductContract.address);
    await deployer.deploy(SLD, process.env.ADMIN_ADDRESS, process.env.SLD_ADDRESS, deployedProductContract.address);
  });
};
