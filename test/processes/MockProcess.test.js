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
const MockProcessArtifact = contract.fromArtifact("MockProcess");

describe("MockProcess", function () {
  const [
    Admin,
    ProcessOwner,
    MachineContract1,
    ProductDID1,
    ProductDID2,
    ProductDID3,
    RandomAddress,
    ProductOwner,
  ] = accounts;

  beforeEach(async function () {
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    this.MockProcessContract = await MockProcessArtifact.new(
      ProcessOwner,
      this.ProductContract.address,
      { from: Admin }
    );
    await this.ProductContract.createProduct(ProductDID1, {
      from: ProductOwner,
    });
    await this.ProductContract.createProduct(ProductDID2, {
      from: ProductOwner,
    });
    await this.ProductContract.createProduct(ProductDID3, {
      from: ProductOwner,
    });
  });

  it("should get the owner address", async function () {
    receipt = await this.MockProcessContract.getProcessOwner();
    expect(receipt).to.equal(ProcessOwner);
  });

  it("should increment process ID", async function () {
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID2, {
      from: ProductOwner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID3, {
      from: ProductOwner,
    });
    ProcessesCount = await this.MockProcessContract.getProcessesCount();
    expect(ProcessesCount.toString()).to.equal("3");
  });

  it("should allow to multiple processes for the same product", async function () {
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    ProcessesCount = await this.MockProcessContract.getProcessesCount();
    expect(ProcessesCount.toString()).to.equal("3");
    ProcessIDForProduct1 = await this.MockProcessContract.getProcessID(
      ProductDID1
    );
    expect(ProcessIDForProduct1.toString()).to.equal("3");
    ProductForProcess1 = await this.MockProcessContract.getProductDID(1);
    expect(ProductForProcess1.toString()).to.equal(ProductDID1);
    ProductForProcess2 = await this.MockProcessContract.getProductDID(2);
    expect(ProductForProcess2.toString()).to.equal(ProductDID1);
    ProductForProcess3 = await this.MockProcessContract.getProductDID(3);
    expect(ProductForProcess3.toString()).to.equal(ProductDID1);
  });

  it("should revert when getting a process for non existing product", async function () {
    receipt = this.MockProcessContract.getProcessID(RandomAddress);
    await expectRevert(receipt, "No process for the given product.");
  });

  it("should revert when getting a product for non existing process", async function () {
    receipt = this.MockProcessContract.getProductDID(1);
    await expectRevert(receipt, "Process doesn't exists.");
    receipt = this.MockProcessContract.getProductDID(0);
    await expectRevert(receipt, "Process doesn't exists.");
  });

  it("should create process instance when starting the process with the right status", async function () {
    receipt = await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    expectEvent(receipt, "ProcessStarted", {
      processID: "1",
      productDID: ProductDID1,
    });
    processInstance = await this.MockProcessContract.getProcessInstance(1);
    expect(processInstance[0]).to.equal(ProductDID1);
    expect(processInstance[3].toString()).to.equal("0");
  });

  it("should emit ProcessFinished event when finish a process", async function () {
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    await this.MockProcessContract.finishProcess(1, 1, {
      from: ProcessOwner,
    });
    processInstance = await this.MockProcessContract.getProcessInstance(1);
    expect(processInstance[0]).to.equal(ProductDID1);
    expect(processInstance[3].toString()).to.equal("1");
  });

  it("should emit ProcessKilled event when kill a process", async function () {
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: ProductOwner,
    });
    await this.MockProcessContract.killProcess(1, {
      from: ProcessOwner,
    });
    processInstance = await this.MockProcessContract.getProcessInstance(1);
    expect(processInstance[0]).to.equal(ProductDID1);
    expect(processInstance[3].toString()).to.equal("3");
  });

  it("should set the machine contract address", async function () {
    await this.MockProcessContract.setMachineAddress(1, MachineContract1, {
      from: ProcessOwner,
    });
    result = await this.MockProcessContract.getMachineAddress(1);
    expect(result).to.equal(MachineContract1);
  });

  it("should revert for setting a wrong machine number", async function () {
    receipt = this.MockProcessContract.setMachineAddress(3, MachineContract1, {
      from: ProcessOwner,
    });
    await expectRevert(receipt, "Unknown Machine Number.");
  });
});
