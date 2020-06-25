var contract = require("@truffle/contract");
const RoleManager = artifacts.require("RoleManager");
const Entities = artifacts.require("Entities");
const Devices = artifacts.require("Devices");


module.exports = function(deployer) {
  deployer.then(async () => {
    var RoleManagerDeployed = await deployer.deploy(RoleManager);
    await deployer.deploy(Entities, RoleManagerDeployed.address);
    await deployer.deploy(Devices, RoleManagerDeployed.address);
  });
};
