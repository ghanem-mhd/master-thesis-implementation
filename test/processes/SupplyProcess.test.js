const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const web3 = require("web3");
const helper = require('../../utilities/helper')

const VGRArtifact = contract.fromArtifact("VGR");
const HBWArtifact = contract.fromArtifact("HBW");
const SupplyingProcessArtifact = contract.fromArtifact("SupplyingProcess");


describe("SupplyingProcess", function () {
    const [ Admin, VGRID, HBWID, product,  ] = accounts;

    beforeEach(async function () {
        this.VGRContract = await VGRArtifact.new(Admin, VGRID, {from: Admin});
        this.HBWContract = await HBWArtifact.new(Admin, HBWID, {from: Admin});
        this.SupplyingProcessContract = await SupplyingProcessArtifact.new({from: Admin});

        this.Manufacturer = this.SupplyingProcessContract.address;

        await this.VGRContract.authorizeManufacturer(this.Manufacturer, {from:Admin});
        await this.HBWContract.authorizeManufacturer(this.Manufacturer, {from:Admin});
        await this.SupplyingProcessContract.setVGRContractAddress(this.VGRContract.address, {from:Admin});
        await this.SupplyingProcessContract.setHBWContractAddress(this.HBWContract.address, {from:Admin});
    });

    it('should trigger the second task after finishing the first one', async function () {
        await this.SupplyingProcessContract.getInfo(product, {from:Admin});
        await this.VGRContract.finishGetInfo(1,"1234", "white", {from:VGRID});
        await this.SupplyingProcessContract.getInfoFinished(product , {from:Admin});
        receipt = await this.HBWContract.getTask(1);
        expect(receipt[1]).to.equal("FetchContainer");
    });

    it('should get the product info for storeWB task', async function () {
        await this.SupplyingProcessContract.getInfo(product, {from:Admin});
        await this.VGRContract.finishGetInfo(1,"1234", "white", {from:VGRID});
        await this.SupplyingProcessContract.getInfoFinished(product , {from:Admin});
        await this.SupplyingProcessContract.dropToHBWFinished(product , {from:Admin});
        receipt = await this.HBWContract.getTask(2);
        expect(receipt[1]).to.equal("StoreWB");
        expect(receipt[4]).to.deep.equal([helper.toHex("id"), helper.toHex("color")]);
        receipt = await this.HBWContract.getTaskInput(2, helper.toHex("id"));
        expect(receipt).to.equal("1234");
        receipt = await this.HBWContract.getTaskInput(2, helper.toHex("color"));
        expect(receipt).to.equal("white");
    });
})