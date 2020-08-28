const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const web3 = require("web3");
const helper = require("../utilities/helper");

const VGRArtifact = contract.fromArtifact("VGR");
const HBWArtifact = contract.fromArtifact("HBW");
const SLDArtifact = contract.fromArtifact("SLD");
const MPOArtifact = contract.fromArtifact("MPO");
const ProductionLineArtifact = contract.fromArtifact("ProductionLine");


describe("ProductionLine", function () {
    const [ Admin, VGRID, HBWID, SLDID, MPOID, product,  ] = accounts;

    beforeEach(async function () {
        this.VGRContract = await VGRArtifact.new(Admin, VGRID, {from: Admin});
        this.HBWContract = await HBWArtifact.new(Admin, HBWID, {from: Admin});
        this.SLDContract = await SLDArtifact.new(Admin, SLDID, {from: Admin});
        this.MPOContract = await MPOArtifact.new(Admin, MPOID, {from: Admin});
        this.ProductionLineContract = await ProductionLineArtifact.new({from: Admin});

        this.Manufacturer = this.ProductionLineContract.address;

        await this.VGRContract.authorizeManufacturer(this.Manufacturer, {from:Admin});
        await this.HBWContract.authorizeManufacturer(this.Manufacturer, {from:Admin});
        await this.MPOContract.authorizeManufacturer(this.Manufacturer, {from:Admin});
        await this.SLDContract.authorizeManufacturer(this.Manufacturer, {from:Admin});
        await this.ProductionLineContract.setVGRContractAddress(this.VGRContract.address, {from:Admin});
        await this.ProductionLineContract.setHBWContractAddress(this.HBWContract.address, {from:Admin});
        await this.ProductionLineContract.setMPOContractAddress(this.MPOContract.address, {from:Admin});
        await this.ProductionLineContract.setSLDContractAddress(this.SLDContract.address, {from:Admin});
    });
})