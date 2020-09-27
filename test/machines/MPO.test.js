const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../../utilities/helper')

const MPOArtifact = contract.fromArtifact('MPO');

describe('MPO', function () {
    const [ MPOOwner, MachineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.MPOContract = await MPOArtifact.new(MPOOwner, MachineID, {from: MPOOwner});
        await this.MPOContract.authorizeManufacturer(Manufacturer, {from:MPOOwner});
    });

    it('should start Process task with correct input', async function () {
        NewTaskEvent = await this.MPOContract.process(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "Process", productDID:product});
    });
})