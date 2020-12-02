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
const ProductArtifact = contract.fromArtifact("Product");
const MPOArtifact = contract.fromArtifact("MPO");

describe("MPO_Machine", function () {
  const [
    Admin,
    MPOOwner,
    MachineID,
    ProductDID,
    anyone,
    ProcessContractAddress,
  ] = accounts;

  beforeEach(async function () {
    this.RegistryContract = await RegistryArtifact.new({ from: Admin });
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    this.MPOContract = await MPOArtifact.new(
      MPOOwner,
      MachineID,
      this.ProductContract.address,
      this.RegistryContract.address,
      { from: MPOOwner }
    );
    await this.MPOContract.authorizeProcess(ProcessContractAddress, {
      from: MPOOwner,
    });
  });

  it("should accept a Processing task", async function () {
    receipt = await this.MPOContract.assignTask(1, ProductDID, 1, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "Processing",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should get the symbol", async function () {
    symbol = await this.MPOContract.getSymbol();
    expect(symbol).to.equal("MPO");
  });

  it("should revert for wrong task type in getTaskTypeName", async function () {
    var receipt = this.MPOContract.getTaskTypeName(0);
    await expectRevert(receipt, "Unknown Task Type.");
  });

  it("should save reading", async function () {
    var receipt = await this.MPOContract.saveReadingMPO(0, 0, 0, {
      from: MachineID,
    });
    var savedReading = await this.MPOContract.getReading(1);
    expect(savedReading[1].toString()).to.equal("0");
    expect(savedReading[2].toString()).to.equal("0");
    expect(savedReading[3].toString()).to.equal("0");
  });

  it("should do nothing when assign unknown task type", async function () {
    receipt = await this.MPOContract.assignTask(1, ProductDID, 100, {
      from: ProcessContractAddress,
    });
    tasksCount = await this.MPOContract.getTasksCount();
    expect(tasksCount.toString()).to.equal("0");
  });
});
