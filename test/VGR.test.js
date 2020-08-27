const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')

const VGRArtifact = contract.fromArtifact('VGR');

describe('VGR', function () {
    const [ VGROwner, MachineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.VGRContract = await VGRArtifact.new(VGROwner, MachineID, {from: VGROwner});
        await this.VGRContract.authorizeManufacturer(Manufacturer, {from:VGROwner});
    });

    it('should start GetInfo task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.getInfo(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "GetInfo", productID:product});
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("code"));
        expect(StoredInputValue, "1");
    });

    it('should save output of the GetInfo task', async function () {
        await this.VGRContract.getInfo(product, {from:Manufacturer});
        await this.VGRContract.finishGetInfo(1, "123", "white", {from: MachineID});
        StoredOutputValue1 = await this.VGRContract.getTaskOutput(1, Helper.toHex("id"));
        StoredOutputValue2 = await this.VGRContract.getTaskOutput(1, Helper.toHex("color"));
        expect(StoredOutputValue1, "123");
        expect(StoredOutputValue2, "white");
    });

    it('should start HBWDrop task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.dropToHBW(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "DropToHBW", productID:product});
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("code"));
        expect(StoredInputValue, "2");
    });


    it('should start MoveHBW2MPO task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.moveHBW2MPO(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "MoveHBW2MPO", productID:product});
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("code"));
        expect(StoredInputValue, "5");
    });

    it('should start PickSorted task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.pickSorted(product, "orange", {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "PickSorted", productID:product});
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("code"));
        expect(StoredInputValue, "2");
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });

})