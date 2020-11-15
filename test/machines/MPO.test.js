const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper");

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
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    this.MPOContract = await MPOArtifact.new(
      MPOOwner,
      MachineID,
      this.ProductContract.address,
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
});
