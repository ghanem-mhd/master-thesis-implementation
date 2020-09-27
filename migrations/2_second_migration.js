
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
    await deployer.deploy(Product);
    await deployer.deploy(MockProcess);
    await deployer.deploy(SupplyingProcess);
    await deployer.deploy(ProductionProcess);
    await deployer.deploy(VGR, process.env.ADMIN, process.env.VGR);
    await deployer.deploy(HBW, process.env.ADMIN, process.env.HBW);
    await deployer.deploy(MPO, process.env.ADMIN, process.env.MPO);
    await deployer.deploy(SLD, process.env.ADMIN, process.env.SLD);
    await deployer.deploy(MockMachine, process.env.ADMIN, process.env.MockMachine);
  });
};
