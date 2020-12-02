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
const SLDArtifact = contract.fromArtifact("SLD");

describe("SLD_Machine", function () {
  const [
    Admin,
    SLDOwner,
    SLD_DID,
    ProductDID,
    anyone,
    ProcessContractAddress,
    ProcessOwner,
    ProductOwner,
  ] = accounts;

  beforeEach(async function () {
    this.RegistryContract = await RegistryArtifact.new({ from: Admin });
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    await this.ProductContract.createProduct(ProductDID, {
      from: ProductOwner,
    });
    this.SLDContract = await SLDArtifact.new(
      SLDOwner,
      SLD_DID,
      this.ProductContract.address,
      this.RegistryContract.address,
      { from: SLDOwner }
    );

    await this.ProductContract.authorizeMachine(
      this.SLDContract.address,
      ProductDID,
      {
        from: ProductOwner,
      }
    );
    await this.SLDContract.authorizeProcess(ProcessContractAddress, {
      from: SLDOwner,
    });
  });

  it("should accept a Sorting task", async function () {
    receipt = await this.SLDContract.assignTask(1, ProductDID, 1, {
      from: ProcessContractAddress,
    });
    expectEvent(receipt, "TaskAssigned", {
      taskID: "1",
      taskName: "Sorting",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
  });

  it("should save the operations of the Sorting task", async function () {
    await this.SLDContract.assignTask(1, ProductDID, 1, {
      from: ProcessContractAddress,
    });
    await this.SLDContract.startTask(1, { from: SLD_DID });
    receipt = await this.SLDContract.finishSorting(1, "Pink", {
      from: SLD_DID,
    });
    expectEvent(receipt, "ProductOperationSaved", {
      operationID: "1",
      taskID: "1",
      productDID: ProductDID,
      operationName: "Sorting",
      operationResult: "Pink",
    });
    expectEvent(receipt, "TaskFinished", {
      taskID: "1",
      taskName: "Sorting",
      productDID: ProductDID,
      processID: "1",
      processContractAddress: ProcessContractAddress,
    });
    StoredProductOperations = await this.SLDContract.getProductOperations(
      ProductDID
    );
    expect(StoredProductOperations[0].toString()).to.equal("1");
    StoredProductOperation = await this.SLDContract.getProductOperation(1);
    expect(StoredProductOperation[0]).to.equal(SLD_DID);
    expect(StoredProductOperation[1].toString()).to.equal("1");
    expect(StoredProductOperation[3]).to.equal("Sorting");
    expect(StoredProductOperation[4]).to.equal("Pink");
  });

  it("should create an alert if brightness below 70 ", async function () {
    var receipt = await this.SLDContract.saveReadingSLD(0, 4, 66, {
      from: SLD_DID,
    });
    expectEvent(receipt, "NewAlert", {
      alertID: "1",
      reason: "Brightness is too low",
      alertType: "1",
    });
    var alertsCount = await this.SLDContract.getAlertsCount();
    expect(alertsCount.toString()).to.equal("1");
    var savedAlert = await this.SLDContract.getAlert(1);
    expect(savedAlert[1].toString()).to.equal("1");
    expect(savedAlert[2].toString()).to.equal("Brightness is too low");
    expect(savedAlert[3].toString()).to.equal("1");
  });

  it("should save reading", async function () {
    var receipt = await this.SLDContract.saveReadingSLD(0, 0, 0, {
      from: SLD_DID,
    });
    var savedReading = await this.SLDContract.getReading(1);
    expect(savedReading[1].toString()).to.equal("0");
    expect(savedReading[2].toString()).to.equal("0");
    expect(savedReading[3].toString()).to.equal("0");
  });

  it("should get the symbol", async function () {
    symbol = await this.SLDContract.getSymbol();
    expect(symbol).to.equal("SLD");
  });

  it("should revert for wrong task type in getTaskTypeName", async function () {
    var receipt = this.SLDContract.getTaskTypeName(0);
    await expectRevert(receipt, "Unknown Task Type.");
  });

  it("should do nothing when assign unknown task type", async function () {
    receipt = await this.SLDContract.assignTask(1, ProductDID, 100, {
      from: ProcessContractAddress,
    });
    tasksCount = await this.SLDContract.getTasksCount();
    expect(tasksCount.toString()).to.equal("0");
  });
});
