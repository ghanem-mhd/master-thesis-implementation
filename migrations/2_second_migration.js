
require('dotenv').config()

var contract = require("@truffle/contract");
const RoleManager = artifacts.require("RoleManager");
const Entities = artifacts.require("Entities");
const Product = artifacts.require("Product");
const DemoProductionLine = artifacts.require("DemoProductionLine");
const SupplyLine = artifacts.require("SupplyLine");
const HBW = artifacts.require("HBW");
const VGR = artifacts.require("VGR");

module.exports = function(deployer) {
  deployer.then(async () => {
    var RoleManagerDeployed = await deployer.deploy(RoleManager);
    await deployer.deploy(Entities, RoleManagerDeployed.address);
    await deployer.deploy(Product);
    await deployer.deploy(DemoProductionLine);
    await deployer.deploy(SupplyLine);
    await deployer.deploy(VGR, process.env.ADMIN, process.env.VGR);
  });
};
