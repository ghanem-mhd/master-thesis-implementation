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
    Owner,
    MachineContract1,
    ProductDID1,
    ProductDID2,
    ProductDID3,
    RandomAddress,
  ] = accounts;

  beforeEach(async function () {
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    this.MockProcessContract = await MockProcessArtifact.new(
      Owner,
      this.ProductContract.address,
      { from: Admin }
    );
  });

  it("should get the owner address", async function () {
    receipt = await this.MockProcessContract.getProcessOwner();
    expect(receipt).to.equal(Owner);
  });

  it("should increment process ID", async function () {
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: Owner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID2, {
      from: Owner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID3, {
      from: Owner,
    });
    ProcessesCount = await this.MockProcessContract.getProcessesCount();
    expect(ProcessesCount.toString()).to.equal("3");
  });

  it("should allow to multiple processes for the same product", async function () {
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: Owner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: Owner,
    });
    await this.MockProcessContract.startMockProcess(ProductDID1, {
      from: Owner,
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
});
