
require('dotenv').config()

const SupplyLine = artifacts.require("SupplyLine");
const HBW = artifacts.require("HBW");
const VGR = artifacts.require("VGR");
const MPO = artifacts.require("MPO");
const SLD = artifacts.require("SLD");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(SupplyLine);
    await deployer.deploy(VGR, process.env.ADMIN, process.env.VGR);
    await deployer.deploy(HBW, process.env.ADMIN, process.env.HBW);
    await deployer.deploy(MPO, process.env.ADMIN, process.env.MPO);
    await deployer.deploy(SLD, process.env.ADMIN, process.env.SLD);
  });
};
