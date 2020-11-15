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
const VGRArtifact = contract.fromArtifact("VGR");

describe("VGR_Machine", function () {
  const [
    Admin,
    VGROwner,
    MachineDID,
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
    this.VGRContract = await VGRArtifact.new(
      VGROwner,
      MachineDID,
      this.ProductContract.address,
      { from: VGROwner }
    );

    await this.ProductContract.authorizeMachine(
      this.VGRContract.address,
      ProductDID,
      {
        from: ProductOwner,
      }
    );
    await this.VGRContract.authorizeProcess(ProcessContractAddress, {
      from: VGROwner,
    });
  });

  it("should accept a GetInfo task", async function () {
    receipt = await this.VGRContract.assignTask(1, ProductDID, 1, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "GetInfo",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should save the operation of the GetInfo task", async function () {
    receipt = await this.VGRContract.assignTask(1, ProductDID, 1, {
      from: ProcessContractAddress,
    });
    await this.VGRContract.startTask(1, { from: MachineDID });
    receipt = await this.VGRContract.finishGetInfoTask(1, "123", "White", {
      from: MachineDID,
    });

    expectEvent(receipt, "ProductOperationSaved", {
      operationID: "2",
      taskID: "1",
      productDID: ProductDID,
      operationName: "ColorDetection",
      operationResult: "White",
    });
    expectEvent(receipt, "ProductOperationSaved", {
      operationID: "1",
      taskID: "1",
      productDID: ProductDID,
      operationName: "NFCTagReading",
      operationResult: "123",
    });

    StoredProductOperations = await this.VGRContract.getProductOperations(
      ProductDID
    );
    expect(StoredProductOperations[0].toString()).to.equal("1");
    expect(StoredProductOperations[1].toString()).to.equal("2");

    StoredProductOperation1 = await this.VGRContract.getProductOperation(1);
    expect(StoredProductOperation1[0]).to.equal(MachineDID);
    expect(StoredProductOperation1[1].toString()).to.equal("1");
    expect(StoredProductOperation1[3]).to.equal("NFCTagReading");
    expect(StoredProductOperation1[4]).to.equal("123");

    StoredProductOperation2 = await this.VGRContract.getProductOperation(2);
    expect(StoredProductOperation2[0]).to.equal(MachineDID);
    expect(StoredProductOperation2[1].toString()).to.equal("1");
    expect(StoredProductOperation2[3]).to.equal("ColorDetection");
    expect(StoredProductOperation2[4]).to.equal("White");
  });

  it("should accept a DropToHBW task", async function () {
    receipt = await this.VGRContract.assignTask(1, ProductDID, 2, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "DropToHBW",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should accept a MoveHBW2MPO task", async function () {
    receipt = await this.VGRContract.assignTask(1, ProductDID, 4, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "MoveHBW2MPO",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should accept a PickSorted task", async function () {
    await this.ProductContract.saveProductOperation(
      ProductDID,
      10,
      "Sorting",
      "Orange",
      { from: ProductOwner }
    );
    receipt = await this.VGRContract.assignTask(1, ProductDID, 3, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "PickSorted",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
    StoredInputValue = await this.VGRContract.getTaskInput(
      1,
      Helper.toHex("color")
    );
    expect(StoredInputValue, "Orange");
  });
});
