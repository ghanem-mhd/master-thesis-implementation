var contract = require("@truffle/contract");
const ProductionLine = artifacts.require("ProductionLine");

module.exports = function(deployer) {
  deployer.deploy(ProductionLine);
};
