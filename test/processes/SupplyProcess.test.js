const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const web3 = require("web3");
const helper = require("../../utilities/helper");

const RegistryArtifact = contract.fromArtifact("Registry");
const ProductArtifact = contract.fromArtifact("Product");
const VGRArtifact = contract.fromArtifact("VGR");
const HBWArtifact = contract.fromArtifact("HBW");
const SupplyingProcessArtifact = contract.fromArtifact("SupplyingProcess");

describe("SupplyingProcess", function () {
  const [
    Admin,
    ProcessOwner,
    VGR_DID,
    HBW_DID,
    ProductDID,
    ProductOwner,
  ] = accounts;

  beforeEach(async function () {
    this.RegistryContract = await RegistryArtifact.new({ from: Admin });
    this.ProductContract = await ProductArtifact.new({ from: Admin });

    await this.ProductContract.createProduct(ProductDID, {
      from: ProductOwner,
    });

    this.VGRContract = await VGRArtifact.new(
      Admin,
      VGR_DID,
      this.ProductContract.address,
      this.RegistryContract.address,
      { from: Admin }
    );
    this.HBWContract = await HBWArtifact.new(
      Admin,
      HBW_DID,
      this.ProductContract.address,
      this.RegistryContract.address,
      { from: Admin }
    );
    this.SupplyingProcessContract = await SupplyingProcessArtifact.new(
      ProcessOwner,
      this.ProductContract.address,
      this.RegistryContract.address,
      { from: Admin }
    );

    await this.VGRContract.authorizeProcess(
      this.SupplyingProcessContract.address,
      {
        from: Admin,
      }
    );
    await this.HBWContract.authorizeProcess(
      this.SupplyingProcessContract.address,
      {
        from: Admin,
      }
    );
    await this.SupplyingProcessContract.setMachineAddress(
      1,
      this.VGRContract.address,
      { from: ProcessOwner }
    );
    await this.SupplyingProcessContract.setMachineAddress(
      2,
      this.HBWContract.address,
      { from: ProcessOwner }
    );
  });

  it("should authorize VGR when executing step 1", async function () {
    await this.SupplyingProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    receipt = await this.SupplyingProcessContract.step1(1, {
      from: ProcessOwner,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "1",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(this.VGRContract.address);
  });

  it("should authorize HBW when executing step 2", async function () {
    await this.SupplyingProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.SupplyingProcessContract.step1(1, {
      from: ProcessOwner,
    });
    receipt = await this.SupplyingProcessContract.step2(1, {
      from: ProcessOwner,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "2",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(this.HBWContract.address);
  });

  it("should authorize VGR when executing step 3", async function () {
    await this.SupplyingProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.SupplyingProcessContract.step1(1, {
      from: ProcessOwner,
    });
    await this.SupplyingProcessContract.step2(1, {
      from: ProcessOwner,
    });
    receipt = await this.SupplyingProcessContract.step3(1, {
      from: ProcessOwner,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "3",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(this.VGRContract.address);
  });

  it("should authorize HBW when executing step 4 and check get info operations", async function () {
    await this.SupplyingProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.SupplyingProcessContract.step1(1, {
      from: ProcessOwner,
    });
    await this.VGRContract.finishGetInfoTask(1, "1234", "white", {
      from: VGR_DID,
    });
    await this.SupplyingProcessContract.step2(1, {
      from: ProcessOwner,
    });
    await this.SupplyingProcessContract.step3(1, {
      from: ProcessOwner,
    });
    receipt = await this.SupplyingProcessContract.step4(1, {
      from: ProcessOwner,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "4",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(this.HBWContract.address);
  });

  it("should get the symbol", async function () {
    symbol = await this.SupplyingProcessContract.getSymbol();
    expect(symbol).to.equal("SP");
  });

  it("should revert for wrong step in getStepTaskType", async function () {
    var receipt = this.SupplyingProcessContract.getStepTaskType(0);
    await expectRevert(receipt, "Wrong step number.");
  });

  it("should revert for wrong step in getMachineNumber", async function () {
    var receipt = this.SupplyingProcessContract.getMachineNumber(0);
    await expectRevert(receipt, "Wrong step number.");
  });
});
