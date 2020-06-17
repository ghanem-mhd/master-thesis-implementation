const MachinesManager = artifacts.require("MachinesManager");
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");

module.exports = function(deployer) {
  deployer.deploy(MachinesManager);
  deployer.deploy(EthereumDIDRegistry);
};
