const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const web3 = require('web3');
const helper = require('../utilities/helper')

const Product = contract.fromArtifact('Product');
const VGRArtifact = contract.fromArtifact('VGR');

describe('VGR', function () {
    const [ VGROwner, machineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.VGRContract = await VGRArtifact.new(VGROwner, machineID, {from: VGROwner});
        await this.VGRContract.authorizeManufacturer(Manufacturer, {from:VGROwner});
    });

    it('should let the owner set the machine ID', async function () {
        storedMachineID = await this.VGRContract.getMachineID();
        expect(storedMachineID).to.equal(machineID);
    });

    it('should let the owner add some info', async function () {
        await this.VGRContract.addInfo(helper.toHex("serialNumber"), helper.toHex("12345"), {from:VGROwner});
        infoNames = await this.VGRContract.getMachineInfoNames()
        expect(infoNames).to.deep.equal([helper.toHex("serialNumber")]);
        storedSerialNumber = await this.VGRContract.getMachineInfo(helper.toHex("serialNumber"))
        expect(helper.toString(storedSerialNumber)).to.equal("12345");
    });

    it('should create a new GetInfo task', async function () {
        receipt = await this.VGRContract.getInfo({from:VGROwner});
        expectEvent(receipt, 'NewTask', { taskID: "1" });
        receipt = await this.VGRContract.getTask(1);
        expect(receipt[1]).to.equal("GetInfo");
    });

    it('should let only the machine to finish a task', async function () {
        receipt = await this.VGRContract.getInfo({from:Manufacturer});
        receipt = this.VGRContract.finishTask(1, {from:anyone});
        expectRevert(receipt, "Only machine can call this function.");
        receipt = await this.VGRContract.finishTask(1, {from:machineID});
        receipt = await this.VGRContract.isTaskFinished(1);
        expect(receipt).to.equal(true);
    });

    it('should emit event getNewReading', async function () {
        receipt = await this.VGRContract.getNewReading(0, {from:VGROwner});
        expectEvent(receipt, 'NewReading', { readingType: "0" });
    });

    it('should store new reading', async function () {
        receipt = await this.VGRContract.storeVGRReading(0, 20, {from:machineID});
        receipt = await this.VGRContract.getReading(1);
        expect(receipt[2].toString()).to.equal("20");
    });

    it('should generate new issue if reading condition has been violated', async function () {
        receipt = await this.VGRContract.storeVGRReading(0, 26, {from:machineID});
        expectEvent(receipt, 'NewIssue', { issueID: "1" });
    });

    it('should deauthorize manufacturer', async function () {
        await this.VGRContract.deauthorizeManufacturer(Manufacturer, {from:VGROwner});
        receipt = this.VGRContract.getInfo({from:Manufacturer});
        expectRevert(receipt, "Only authorized manufactures can call this function.");
    });
})