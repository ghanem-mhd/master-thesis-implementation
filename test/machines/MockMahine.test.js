const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../helper")

const MockMachineArtifact = contract.fromArtifact("MockMachine");

describe("Machine", function () {
    const [ MachineOwner, MachineDID, product, anyone, Manufacturer, Maintainer, ProductContractAddress ] = accounts;

    beforeEach(async function () {
        this.MockMachineContract = await MockMachineArtifact.new(MachineOwner, MachineDID, ProductContractAddress, {from: MachineOwner});
        await this.MockMachineContract.authorizeManufacturer(Manufacturer, {from:MachineOwner});
        await this.MockMachineContract.authorizeMaintainer(Maintainer, {from:MachineOwner});
    });

    it("get the machine ID", async function () {
        storedMachineID = await this.MockMachineContract.getMachineID();
        expect(storedMachineID).to.equal(MachineDID);
    });

    it("should let the owner to save machine info", async function () {
        await this.MockMachineContract.saveMachineInfo(Helper.toHex("serialNumber"), Helper.toHex("12345"), { from:MachineOwner });
        infoNames = await this.MockMachineContract.getMachineInfoNames()
        expect(infoNames).to.deep.equal([Helper.toHex("serialNumber")]);
        storedSerialNumber = await this.MockMachineContract.getMachineInfo(Helper.toHex("serialNumber"))
        expect(Helper.toString(storedSerialNumber)).to.equal("12345");
    });

    it("should only allow the owner to save machine info", async function () {
        var receipt = this.MockMachineContract.saveMachineInfo(Helper.toHex(""), Helper.toHex(""), { from:anyone });
        await expectRevert(receipt, "Only machine owner can call this function.");
    });

    it("should deauthorize maintainer", async function () {
        await this.MockMachineContract.deauthorizeMaintainer(Maintainer, {from:MachineOwner});
        var receipt = this.MockMachineContract.saveMaintenanceOperation("Maintenance description" ,{from:Maintainer});
        await expectRevert(receipt, "Only authorized maintainers can call this function.");
    });

    it("should deauthorize manufacturer", async function () {
        await this.MockMachineContract.deauthorizeManufacturer(Manufacturer, {from:MachineOwner});
        var receipt = this.MockMachineContract.assignTaskWithProduct(1, product, "someTaskName" ,{from:Manufacturer});
        await expectRevert(receipt, "Only authorized manufactures can call this function.");
    });

    it("should create a task", async function () {
        tasksCount = await this.MockMachineContract.getTasksCount();
        expect(tasksCount.toString()).to.equal("0");
        await this.MockMachineContract.assignTaskWithProduct(1, product, "someTaskName", {from:Manufacturer});
        tasksCount = await this.MockMachineContract.getTasksCount();
        expect(tasksCount.toString()).to.equal("1");
    });

    it("assigning a task should create a TaskAssigned event", async function () {
        receipt = await this.MockMachineContract.assignTaskWithoutProduct(1, "someTaskName", {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"someTaskName", productDID:constants.ZERO_ADDRESS, processID: "1", processContractAddress:Manufacturer });
    });

    it("starting a task should create a TaskAssigned event", async function () {
        receipt = await this.MockMachineContract.assignTaskWithoutProduct(1, "someTaskName", {from:Manufacturer});
        receipt = await this.MockMachineContract.startTask(1, {from:MachineDID});
        expectEvent(receipt, "TaskStarted", { taskID: "1", taskName:"someTaskName", productDID:constants.ZERO_ADDRESS, processID: "1", processContractAddress:Manufacturer });
    });

    it("should get the task information", async function () {
        receipt = await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", {from:Manufacturer});
        savedTask = await this.MockMachineContract.getTask(1);
        expect(savedTask[0]).to.equal(constants.ZERO_ADDRESS);
        expect(savedTask[1]).to.equal("task1");
        expect(savedTask[4]).to.deep.equal([ Helper.toHex("taskInput")]);

        receipt = await this.MockMachineContract.assignTaskWithProduct(1, product, "task2", {from:Manufacturer});
        savedTask = await this.MockMachineContract.getTask(2);
        expect(savedTask[0]).to.equal(product);
        expect(savedTask[1]).to.equal("task2");
        expect(savedTask[4]).to.deep.equal([]);
    });

    it("should save task input", async function () {
        await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", { from : Manufacturer } );
        await this.MockMachineContract.saveTaskParam(1, Helper.toHex("inputName"), "inputValue",  { from : Manufacturer });
        saveTaskParam = await this.MockMachineContract.getTaskInput(1, Helper.toHex("inputName"));
        expect(saveTaskParam).to.equal("inputValue");
    });


    it("should get task name", async function () {
        await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", { from : Manufacturer });
        taskName = await this.MockMachineContract.getTaskName(1);
        expect(taskName).to.equal("task1");
    });

    it("should emit TaskFinished event", async function () {
        await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", { from : Manufacturer });
        taskFinishedEvent = await this.MockMachineContract.finishTask(1, {from:MachineDID});
        expectEvent(taskFinishedEvent, "TaskFinished", { taskID: "1", taskName:"task1", productDID:constants.ZERO_ADDRESS });
    });

    it("only machine can finish the task", async function () {
        await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", { from : Manufacturer });
        receipt = this.MockMachineContract.finishTask(1, {from:anyone});
        await expectRevert(receipt, "Only machine can call this function.");
    });

    it("should give task status", async function () {
        await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", { from : Manufacturer });
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(false);
        taskFinishedEvent = await this.MockMachineContract.finishTask(1, {from:MachineDID});
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(true);
    });

    it("killing a task will make it finished", async function () {
        await this.MockMachineContract.assignTaskWithoutProduct(1, "task1", { from : Manufacturer });
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(false);
        taskFinishedEvent = await this.MockMachineContract.killTask(1, {from:MachineOwner});
        isTaskFinished = await this.MockMachineContract.isTaskFinished(1);
        expect(isTaskFinished).to.equal(true);
    });

    it("calling getNewReading should emit NewReading event", async function () {
        newReadingEvent = await this.MockMachineContract.getNewReading(0, { from : MachineOwner });
        expectEvent(newReadingEvent, "NewReading", { readingType: "0"});
    });

    it("should save/get a reading", async function () {
        var currentTaskID = 1;
        var readingType = 0;
        var readingValue = 25;
        await this.MockMachineContract.saveMockReading(currentTaskID, readingType, readingValue,  { from : MachineDID });
        var readingsCount = await this.MockMachineContract.getReadingsCount();
        expect(readingsCount.toString()).to.equal("1");
        var savedReading = await this.MockMachineContract.getReading(1);
        expect(savedReading[1].toString()).to.equal(readingType.toString());
        expect(savedReading[2].toString()).to.equal(readingValue.toString());
        expect(savedReading[3].toString()).to.equal(currentTaskID.toString());
    });

    it("should create a new issue if reading value exceeded a threshold", async function () {
        var currentTaskID = 1;
        var readingType = 0;
        var readingValue = 50;
        var receipt = await this.MockMachineContract.saveMockReading(currentTaskID, readingType, readingValue,  { from : MachineDID });
        expectEvent(receipt, "NewIssue", { issueID: "1", reason: "critical temperature threshold exceeded", issueType: "Critical"});
        var savedIssue = await this.MockMachineContract.getIssue(1);
        expect(savedIssue[1].toString()).to.equal("1");
        expect(savedIssue[2].toString()).to.equal("critical temperature threshold exceeded");
        expect(savedIssue[3].toString()).to.equal("Critical");
    });

    it("should create/get a new maintenance operation", async function () {
        var receipt = await this.MockMachineContract.saveMaintenanceOperation("Maintenance description",  { from : Maintainer });
        expectEvent(receipt, "NewMaintenanceOperation", {
            maintenanceOperationID: "1",
            maintainer: Maintainer,
            description: "Maintenance description"
        });
        var savedMaintenanceOperation = await this.MockMachineContract.getMaintenanceOperation(1);
        expect(savedMaintenanceOperation[1]).to.equal(Maintainer);
        expect(savedMaintenanceOperation[2]).to.equal("Maintenance description");
    });

    it("should getAuthorizedManufacturers", async function () {
        var receipt = await this.MockMachineContract.getAuthorizedManufacturers();
        expect(receipt[0]).to.equal(Manufacturer);
    });

    it("should getAuthorizedMaintainers", async function () {
        var receipt = await this.MockMachineContract.getAuthorizedMaintainers();
        expect(receipt[0]).to.equal(Maintainer);
    });

})