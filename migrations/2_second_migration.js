
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
    await deployer.deploy(MockProcess);
    await deployer.deploy(SupplyingProcess);
    await deployer.deploy(ProductionProcess);
    await deployer.deploy(VGR, process.env.ADMIN, process.env.VGR, deployedProductContract.address);
    await deployer.deploy(HBW, process.env.ADMIN, process.env.HBW, deployedProductContract.address);
    await deployer.deploy(MPO, process.env.ADMIN, process.env.MPO, deployedProductContract.address);
    await deployer.deploy(SLD, process.env.ADMIN, process.env.SLD, deployedProductContract.address);
    await deployer.deploy(MockMachine, process.env.ADMIN, process.env.MockMachine, deployedProductContract.address);
  });
};
