const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../../utilities/helper')

const SLDArtifact = contract.fromArtifact('SLD');

describe('SLD', function () {
    const [ SLDOwner, MachineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.SLDContract = await SLDArtifact.new(SLDOwner, MachineID, {from: SLDOwner});
        await this.SLDContract.authorizeManufacturer(Manufacturer, {from:SLDOwner});
    });

    it('should start Sort task with correct input', async function () {
        NewTaskEvent = await this.SLDContract.sort(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "Sort", productID:product});
    });

    it('should save the operation of the Sort task', async function () {
        await this.SLDContract.sort(product, {from:Manufacturer});
        await this.SLDContract.finishSorting(1, "pink", {from: MachineID});
        StoredProductOperations = await this.SLDContract.getProductOperations(product);
        expect(StoredProductOperations).to.deep.equal([ Helper.toHex("ColorDetection")]);
        StoredProductOperation = await this.SLDContract.getProductOperationValue(product, Helper.toHex("ColorDetection"));
        expect(StoredProductOperation, "pink");

    });

    it('should create an issue if brightness below 70 ', async function () {
        var receipt = await this.SLDContract.saveReadingSLD(0, 4, 66, {from: MachineID});
        expectEvent(receipt, 'NewIssue', { issueID: "1", reason: "Brightness is too low", issueType:"Major"});
        var savedIssue = await this.SLDContract.getIssue(1);
        expect(savedIssue[1].toString()).to.equal("1");
        expect(savedIssue[2].toString()).to.equal("Brightness is too low");
        expect(savedIssue[3].toString()).to.equal("Major");
    });
})