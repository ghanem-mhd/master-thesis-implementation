const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper");

const RegistryArtifact = contract.fromArtifact("Registry");
const MockMachineArtifact = contract.fromArtifact("MockMachine");

describe("MockMachine", function () {
  const [
    Admin,
    MachineOwner,
    MachineDID,
    ProductDID,
    anyone,
    ProcessContractAddress,
    ProductContractAddress,
  ] = accounts;

  beforeEach(async function () {
    this.RegistryContract = await RegistryArtifact.new({ from: Admin });
    this.MockMachineContract = await MockMachineArtifact.new(
      MachineOwner,
      MachineDID,
      ProductContractAddress,
      this.RegistryContract.address,
      { from: MachineOwner }
    );
    await this.MockMachineContract.authorizeProcess(ProcessContractAddress, {
      from: MachineOwner,
    });
  });

  it("get the machine ID", async function () {
    storedMachineID = await this.MockMachineContract.getMachineDID();
    expect(storedMachineID).to.equal(MachineDID);
  });

  it("should let the owner to save machine info", async function () {
    await this.MockMachineContract.saveMachineInfo(
      Helper.toHex("serialNumber"),
      Helper.toHex("12345"),
      { from: MachineOwner }
    );
    infoNames = await this.MockMachineContract.getMachineInfoNames();
    expect(infoNames).to.deep.equal([Helper.toHex("serialNumber")]);
    storedSerialNumber = await this.MockMachineContract.getMachineInfo(
      Helper.toHex("serialNumber")
    );
    expect(Helper.toString(storedSerialNumber)).to.equal("12345");
  });

  it("should only allow the owner to save machine info", async function () {
    var receipt = this.MockMachineContract.saveMachineInfo(
      Helper.toHex(""),
      Helper.toHex(""),
      { from: anyone }
    );
    await expectRevert(receipt, "Only machine owner can call this function.");
  });

  it("should create a task", async function () {
    tasksCount = await this.MockMachineContract.getTasksCount();
    expect(tasksCount.toString()).to.equal("0");
    await this.MockMachineContract.assignTask(1, ProductDID, 2, {
      from: ProcessContractAddress,
    });
    tasksCount = await this.MockMachineContract.getTasksCount();
    expect(tasksCount.toString()).to.equal("1");
  });

  it("assigning a task should create a TaskAssigned event", async function () {
    receipt = await this.MockMachineContract.assignTask(
      1,
      constants.ZERO_ADDRESS,
      1,
      { from: ProcessContractAddress }
    );
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "TaskWithoutProduct",
      productDID: constants.ZERO_ADDRESS,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("starting a task should create a TaskAssigned event", async function () {
    receipt = await this.MockMachineContract.assignTask(
      1,
      constants.ZERO_ADDRESS,
      1,
      { from: ProcessContractAddress }
    );
    receipt = await this.MockMachineContract.startTask(1, { from: MachineDID });
    expectEvent(receipt, "TaskStarted", {
      taskID: "1",
      taskName: "TaskWithoutProduct",
      productDID: constants.ZERO_ADDRESS,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should get the task information", async function () {
    receipt = await this.MockMachineContract.assignTask(
      1,
      constants.ZERO_ADDRESS,
      1,
      { from: ProcessContractAddress }
    );
    savedTask = await this.MockMachineContract.getTask(1);
    expect(savedTask[0]).to.equal(constants.ZERO_ADDRESS);
    expect(savedTask[1]).to.equal("TaskWithoutProduct");
    expect(savedTask[4]).to.equal("");
    expect(savedTask[5].toString()).to.equal("0");

    receipt = await this.MockMachineContract.assignTask(1, ProductDID, 2, {
      from: ProcessContractAddress,
    });
    savedTask = await this.MockMachineContract.getTask(2);
    expect(savedTask[0]).to.equal(ProductDID);
    expect(savedTask[1]).to.equal("TaskWithProduct");
    expect(savedTask[4]).to.equal("");
    expect(savedTask[5].toString()).to.equal("0");
  });

  it("should save task input", async function () {
    await this.MockMachineContract.assignTask(1, constants.ZERO_ADDRESS, 1, {
      from: ProcessContractAddress,
    });
    await this.MockMachineContract.saveTaskParam(
      1,
      Helper.toHex("inputName"),
      "inputValue",
      { from: ProcessContractAddress }
    );
    saveTaskParam = await this.MockMachineContract.getTaskInput(
      1,
      Helper.toHex("inputName")
    );
    expect(saveTaskParam).to.equal("inputValue");
  });

  it("should get task name", async function () {
    await this.MockMachineContract.assignTask(1, constants.ZERO_ADDRESS, 1, {
      from: ProcessContractAddress,
    });
    taskName = await this.MockMachineContract.getTaskName(1);
    expect(taskName).to.equal("TaskWithoutProduct");
  });

  it("should emit TaskFinished event", async function () {
    await this.MockMachineContract.assignTask(1, constants.ZERO_ADDRESS, 1, {
      from: ProcessContractAddress,
    });
    taskFinishedEvent = await this.MockMachineContract.finishTask(1, 2, "", {
      from: MachineDID,
    });
    expectEvent(taskFinishedEvent, "TaskFinished", {
      taskID: "1",
      taskName: "TaskWithoutProduct",
      productDID: constants.ZERO_ADDRESS,
      status: "2",
    });
  });

  it("only machine can finish the task", async function () {
    await this.MockMachineContract.assignTask(1, constants.ZERO_ADDRESS, 1, {
      from: ProcessContractAddress,
    });
    receipt = this.MockMachineContract.finishTask(1, 2, "", { from: anyone });
    await expectRevert(receipt, "Only machine can call this function.");
  });

  it("should get task status - Assigned/Started/FinishedSuccessfully", async function () {
    taskStatus = await this.MockMachineContract.assignTask(
      1,
      constants.ZERO_ADDRESS,
      1,
      {
        from: ProcessContractAddress,
      }
    );
    taskStatus = await this.MockMachineContract.getTaskStatus(1);
    expect(taskStatus.toString()).to.equal("0");
    await this.MockMachineContract.startTask(1, {
      from: MachineDID,
    });
    taskStatus = await this.MockMachineContract.getTaskStatus(1);
    expect(taskStatus.toString()).to.equal("1");
    await this.MockMachineContract.finishTask(1, 2, "", {
      from: MachineDID,
    });
    taskStatus = await this.MockMachineContract.getTaskStatus(1);
    expect(taskStatus.toString()).to.equal("2");
  });

  it("should get task status - Assigned/Started/FinishedUnSuccessfully", async function () {
    taskStatus = await this.MockMachineContract.assignTask(
      1,
      constants.ZERO_ADDRESS,
      1,
      {
        from: ProcessContractAddress,
      }
    );
    taskStatus = await this.MockMachineContract.getTaskStatus(1);
    expect(taskStatus.toString()).to.equal("0");
    await this.MockMachineContract.startTask(1, {
      from: MachineDID,
    });
    taskStatus = await this.MockMachineContract.getTaskStatus(1);
    expect(taskStatus.toString()).to.equal("1");

    await this.MockMachineContract.finishTask(1, 3, "", {
      from: MachineDID,
    });
    taskStatus = await this.MockMachineContract.getTaskStatus(1);
    expect(taskStatus.toString()).to.equal("3");
  });

  it("calling getNewReading should emit NewReading event", async function () {
    newReadingEvent = await this.MockMachineContract.getNewReading(0, {
      from: MachineOwner,
    });
    expectEvent(newReadingEvent, "NewReading", { readingType: "0" });
  });

  it("should save/get a reading", async function () {
    var currentTaskID = 1;
    var readingType = 0;
    var readingValue = 25;
    await this.MockMachineContract.saveMockReading(
      currentTaskID,
      readingType,
      readingValue,
      { from: MachineDID }
    );
    var readingsCount = await this.MockMachineContract.getReadingsCount();
    expect(readingsCount.toString()).to.equal("1");
    var savedReading = await this.MockMachineContract.getReading(1);
    expect(savedReading[1].toString()).to.equal(readingType.toString());
    expect(savedReading[2].toString()).to.equal(readingValue.toString());
    expect(savedReading[3].toString()).to.equal(currentTaskID.toString());
  });

  it("should create a new alert if reading value exceeded a threshold", async function () {
    var currentTaskID = 1;
    var readingType = 0;
    var readingValue = 50;
    var receipt = await this.MockMachineContract.saveMockReading(
      currentTaskID,
      readingType,
      readingValue,
      { from: MachineDID }
    );
    expectEvent(receipt, "NewAlert", {
      alertID: "1",
      reason: "critical temperature threshold exceeded",
      alertType: "Critical",
    });
    var savedAlert = await this.MockMachineContract.getAlert(1);
    expect(savedAlert[1].toString()).to.equal("1");
    expect(savedAlert[2].toString()).to.equal(
      "critical temperature threshold exceeded"
    );
    expect(savedAlert[3].toString()).to.equal("Critical");
  });

  it("should getAuthorizedProcesses", async function () {
    var receipt = await this.MockMachineContract.getAuthorizedProcesses();
    expect(receipt[0]).to.equal(ProcessContractAddress);
  });
});
