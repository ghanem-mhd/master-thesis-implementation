var contract = require("@truffle/contract");
const RoleManager = artifacts.require("RoleManager");

module.exports = function(deployer) {
  deployer.deploy(RoleManager);
};
