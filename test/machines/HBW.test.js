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
const HBWArtifact = contract.fromArtifact("HBW");

describe("HBW_Machine", function () {
  const [
    Admin,
    HBWOwner,
    MachineID,
    ProductDID,
    anyone,
    ProcessContractAddress,
    ProductOwner,
  ] = accounts;

  beforeEach(async function () {
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    await this.ProductContract.createProduct(ProductDID, {
      from: ProductOwner,
    });

    this.HBWContract = await HBWArtifact.new(
      HBWOwner,
      MachineID,
      this.ProductContract.address,
      { from: HBWOwner }
    );
    await this.HBWContract.authorizeProcess(ProcessContractAddress, {
      from: HBWOwner,
    });
  });

  it("should accept a FetchContainer task", async function () {
    receipt = await this.HBWContract.assignTask(1, constants.ZERO_ADDRESS, 1, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "FetchContainer",
      productDID: constants.ZERO_ADDRESS,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should accept a StoreContainer task", async function () {
    receipt = await this.HBWContract.assignTask(1, constants.ZERO_ADDRESS, 2, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "StoreContainer",
      productDID: constants.ZERO_ADDRESS,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should accept a StoreProduct task", async function () {
    await this.ProductContract.saveProductOperation(
      ProductDID,
      10,
      "ColorDetection",
      "orange",
      { from: ProductOwner }
    );
    await this.ProductContract.saveProductOperation(
      ProductDID,
      10,
      "NFCTagReading",
      "123",
      { from: ProductOwner }
    );
    receipt = await this.HBWContract.assignTask(1, ProductDID, 3, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "StoreProduct",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
    StoredInputValue = await this.HBWContract.getTaskInput(
      1,
      Helper.toHex("id")
    );
    expect(StoredInputValue, "123");
    StoredInputValue = await this.HBWContract.getTaskInput(
      1,
      Helper.toHex("color")
    );
    expect(StoredInputValue, "orange");
  });

  it("should accept a FetchProduct task", async function () {
    receipt = await this.HBWContract.assignTask(1, ProductDID, 4, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "FetchProduct",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });
});
