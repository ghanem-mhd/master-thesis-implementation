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
    });

    it('should save output of the GetInfo task', async function () {
        await this.VGRContract.getInfo(product, {from:Manufacturer});
        await this.VGRContract.finishGetInfo(1, "123", "white", {from: MachineID});
        StoredProductOperations = await this.VGRContract.getProductOperations(product);
        expect(StoredProductOperations).to.deep.equal([ Helper.toHex("NFCTagReading"),Helper.toHex("ColorDetection")]);
        StoredProductValue1 = await this.VGRContract.getProductOperationValue(product, Helper.toHex("NFCTagReading"));
        StoredProductValue2 = await this.VGRContract.getProductOperationValue(product, Helper.toHex("ColorDetection"));
        expect(StoredProductValue1, "123");
        expect(StoredProductValue2, "white");
    });
    it('should start HBWDrop task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.dropToHBW(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "DropToHBW", productID:product});
    });


    it('should start MoveHBW2MPO task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.moveHBW2MPO(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "MoveHBW2MPO", productID:product});
    });

    it('should start PickSorted task with correct input', async function () {
        NewTaskEvent = await this.VGRContract.pickSorted(product, "orange", {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "PickSorted", productID:product});
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });

})