const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')

const SLDArtifact = contract.fromArtifact('SLD');

describe('SLD', function () {
    const [ SLDOwner, MachineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.SLDContract = await SLDArtifact.new(SLDOwner, MachineID, {from: SLDOwner});
        await this.SLDContract.authorizeManufacturer(Manufacturer, {from:SLDOwner});
    });

    it('should start StartSorting task with correct input', async function () {
        NewTaskEvent = await this.SLDContract.startSorting(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "StartSorting", productID:product});
        StoredInputValue = await this.SLDContract.getTaskInput(1, Helper.toHex("code"));
        expect(StoredInputValue, "8");
    });

    it('should save the output of the StartSorting task', async function () {
        await this.SLDContract.startSorting(product, {from:Manufacturer});
        await this.SLDContract.finishSorting(1, "pink", {from: MachineID});
        StoredOutputValue = await this.SLDContract.getTaskOutput(1, Helper.toHex("color"));
        expect(StoredOutputValue, "pink");
    });
})