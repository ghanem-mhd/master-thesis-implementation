var contract = require("@truffle/contract");
const RoleManager = artifacts.require("RoleManager");
const Entities = artifacts.require("Entities");
const Machines = artifacts.require("Machines");
const Product = artifacts.require("Product");
const DemoProductionLine = artifacts.require("DemoProductionLine");
const SupplyLine = artifacts.require("SupplyLine");

module.exports = function(deployer) {
  deployer.then(async () => {
    var RoleManagerDeployed = await deployer.deploy(RoleManager);
    await deployer.deploy(Entities, RoleManagerDeployed.address);
    await deployer.deploy(Machines, RoleManagerDeployed.address);
    await deployer.deploy(Product);
    await deployer.deploy(DemoProductionLine);
    await deployer.deploy(SupplyLine);
  });
};
