const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-Helpers');
const { expect } = require('chai');
const Helper = require('../utilities/Helper')

const MockMachineArtifact = contract.fromArtifact('MockMachine');

describe('MockMachine', function () {
    const [ MachineOwner, machineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.MockMachineContract = await MockMachineArtifact.new(MachineOwner, machineID, {from: MachineOwner});
        await this.MockMachineContract.authorizeManufacturer(Manufacturer, {from:MachineOwner});
    });

    it('get the machine ID', async function () {
        storedMachineID = await this.MockMachineContract.getMachineID();
        expect(storedMachineID).to.equal(machineID);
    });

    it('should let the owner to save machine info', async function () {
        await this.MockMachineContract.saveMachineInfo(Helper.toHex("serialNumber"), Helper.toHex("12345"), { from:MachineOwner });
        infoNames = await this.MockMachineContract.getMachineInfoNames()
        expect(infoNames).to.deep.equal([Helper.toHex("serialNumber")]);
        storedSerialNumber = await this.MockMachineContract.getMachineInfo(Helper.toHex("serialNumber"))
        expect(Helper.toString(storedSerialNumber)).to.equal("12345");
    });

    it('should only allow the owner to save machine info', async function () {
        var receipt = this.MockMachineContract.saveMachineInfo(Helper.toHex(""), Helper.toHex(""), { from:anyone });
        await expectRevert(receipt, "Only machine owner can call this function.");
    });

    it('should deauthorize manufacturer', async function () {
        await this.MockMachineContract.deauthorizeManufacturer(Manufacturer, {from:MachineOwner});
        var receipt = this.MockMachineContract.createTaskWithProduct(product, "someTaskName" ,{from:Manufacturer});
        await expectRevert(receipt, "Only authorized manufactures can call this function.");
    });

    it('should create a task', async function () {
        tasksCount = await this.MockMachineContract.getTasksCount();
        expect(tasksCount.toString()).to.equal("0");
        await this.MockMachineContract.createTaskWithProduct(product, "someTaskName", {from:Manufacturer});
        tasksCount = await this.MockMachineContract.getTasksCount();
        expect(tasksCount.toString()).to.equal("1");
    });

    it('create a task should save an empty product', async function () {
        await this.MockMachineContract.createTaskWithProduct(product, "someTaskName", {from:Manufacturer});
        savedProduct = await this.MockMachineContract.getProduct(product);
        expect(savedProduct[1]).to.deep.equal([]);
    });

    it('create a task should not save product twice', async function () {
        await this.MockMachineContract.createTaskWithProduct(product, "someTaskName", {from:Manufacturer});
        await this.MockMachineContract.createTaskWithProduct(product, "someTaskName", {from:Manufacturer});
    });

    it('should revert on saving same product twice', async function () {
        await this.MockMachineContract.saveMockProduct(product, {from:Manufacturer});
        var receipt = this.MockMachineContract.saveMockProduct(product, {from:Manufacturer});
        await expectRevert(receipt, "Product already exists.");
    });

    it('starting a task should create a NewTask event', async function () {
        receipt = await this.MockMachineContract.createTaskWithoutProduct("someTaskName", {from:Manufacturer});
        expectEvent(receipt, 'NewTask', { taskID: "1", taskName:"someTaskName", productID:constants.ZERO_ADDRESS });
    });

    it('should get the task information', async function () {
        receipt = await this.MockMachineContract.createTaskWithoutProduct("task1", {from:Manufacturer});
        savedTask = await this.MockMachineContract.getTask(1);
        expect(savedTask[0]).to.equal(constants.ZERO_ADDRESS);
        expect(savedTask[1]).to.equal("task1");
        expect(savedTask[4]).to.deep.equal([ Helper.toHex("taskInput")]);
        expect(savedTask[5]).to.deep.equal([]);

        receipt = await this.MockMachineContract.createTaskWithProduct(product, "task2", {from:Manufacturer});
        savedTask = await this.MockMachineContract.getTask(2);
        expect(savedTask[0]).to.equal(product);
        expect(savedTask[1]).to.equal("task2");
        expect(savedTask[4]).to.deep.equal([]);
        expect(savedTask[5]).to.deep.equal([]);
    });

    it('should save task input', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer } );
        await this.MockMachineContract.saveInput(1, Helper.toHex("inputName"), "inputValue",  { from : Manufacturer });
        saveInput = await this.MockMachineContract.getTaskInput(1, Helper.toHex("inputName"));
        expect(saveInput).to.equal("inputValue");
    });

    it('should save task output', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer });
        await this.MockMachineContract.saveOutput(1, Helper.toHex("outputName"), "outputValue",  { from : machineID });
        saveOutput = await this.MockMachineContract.getTaskOutput(1, Helper.toHex("outputName"));
        expect(saveOutput).to.equal("outputValue");
    });

    it('should get task name', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer });
        taskName = await this.MockMachineContract.getTaskName(1);
        expect(taskName).to.equal("task1");
    });

    it('should emit TaskFinished event', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer });
        taskFinishedEvent = await this.MockMachineContract.finishTask(1, {from:machineID});
        expectEvent(taskFinishedEvent, 'TaskFinished', { taskID: "1", taskName:"task1", productID:constants.ZERO_ADDRESS });
    });

    it('only machine can finish the task', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer });
        receipt = this.MockMachineContract.finishTask(1, {from:anyone});
        await expectRevert(receipt, "Only machine can call this function.");
    });

    it('should save task output while finishing the task', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("taskWithOutput", { from : Manufacturer });
        await this.MockMachineContract.finishTheTask(1, "outputValue", { from : machineID });
        savedTask = await this.MockMachineContract.getTask(1);
        expect(savedTask[0]).to.equal(constants.ZERO_ADDRESS);
        expect(savedTask[1]).to.equal("taskWithOutput");
        expect(savedTask[4]).to.deep.equal([ Helper.toHex("taskInput")]);
        expect(savedTask[5]).to.deep.equal([ Helper.toHex("taskOutput")]);
        savedOutput = await this.MockMachineContract.getTaskOutput(1, Helper.toHex("taskOutput"), { from : machineID });
        expect(savedOutput).to.equal("outputValue");
    });

    it('should give task status', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer });
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(false);
        taskFinishedEvent = await this.MockMachineContract.finishTask(1, {from:machineID});
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(true);
    });

    it('killing a task will make it finished', async function () {
        await this.MockMachineContract.createTaskWithoutProduct("task1", { from : Manufacturer });
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(false);
        taskFinishedEvent = await this.MockMachineContract.killTask(1, {from:MachineOwner});
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(true);
    });
})