const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const web3 = require("web3");
const Helper = require("../../utilities/helper");

const ProductArtifact = contract.fromArtifact("Product");
const VGRArtifact = contract.fromArtifact("VGR");
const HBWArtifact = contract.fromArtifact("HBW");
const SLDArtifact = contract.fromArtifact("SLD");
const MPOArtifact = contract.fromArtifact("MPO");
const ProductionProcessArtifact = contract.fromArtifact("ProductionProcess");

describe("ProductionProcess", function () {
  const [
    Admin,
    VGR_DID,
    HBW_DID,
    SLD_DID,
    MPO_DID,
    ProductDID,
    ProcessOwner,
    ProductOwner,
  ] = accounts;

  beforeEach(async function () {
    this.ProductContract = await ProductArtifact.new({ from: Admin });
    await this.ProductContract.createProduct(ProductDID, {
      from: ProductOwner,
    });

    this.VGRContract = await VGRArtifact.new(
      Admin,
      VGR_DID,
      this.ProductContract.address,
      { from: Admin }
    );
    this.HBWContract = await HBWArtifact.new(
      Admin,
      HBW_DID,
      this.ProductContract.address,
      { from: Admin }
    );
    this.SLDContract = await SLDArtifact.new(
      Admin,
      SLD_DID,
      this.ProductContract.address,
      { from: Admin }
    );
    this.MPOContract = await MPOArtifact.new(
      Admin,
      MPO_DID,
      this.ProductContract.address,
      { from: Admin }
    );

    this.ProductionProcessContract = await ProductionProcessArtifact.new(
      ProcessOwner,
      this.ProductContract.address,
      { from: Admin }
    );

    await this.VGRContract.authorizeProcess(
      this.ProductionProcessContract.address,
      {
        from: Admin,
      }
    );
    await this.HBWContract.authorizeProcess(
      this.ProductionProcessContract.address,
      {
        from: Admin,
      }
    );
    await this.MPOContract.authorizeProcess(
      this.ProductionProcessContract.address,
      {
        from: Admin,
      }
    );
    await this.SLDContract.authorizeProcess(
      this.ProductionProcessContract.address,
      {
        from: Admin,
      }
    );
    await this.ProductionProcessContract.setMachineAddress(
      1,
      this.HBWContract.address,
      { from: ProcessOwner }
    );
    await this.ProductionProcessContract.setMachineAddress(
      2,
      this.VGRContract.address,
      { from: ProcessOwner }
    );
    await this.ProductionProcessContract.setMachineAddress(
      3,
      this.MPOContract.address,
      { from: ProcessOwner }
    );
    await this.ProductionProcessContract.setMachineAddress(
      4,
      this.SLDContract.address,
      { from: ProcessOwner }
    );
  });

  it("should authorize HBW when executing step 1", async function () {
    await this.ProductionProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    receipt = await this.ProductionProcessContract.step1(1, {
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
    expect(AuthorizedMachine).to.equal(this.HBWContract.address);
    processInstance = await this.ProductionProcessContract.getProcessInstance(
      1
    );
    expect(processInstance[0]).to.equal(ProductDID);
    expect(processInstance[3].toString()).to.equal("0");
    expect(processInstance[4].toString()).to.equal("1");
  });

  it("should authorize VGR when executing step 2", async function () {
    await this.ProductionProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.ProductionProcessContract.step1(1, {
      from: ProcessOwner,
    });
    receipt = await this.ProductionProcessContract.step2(1, {
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
    expect(AuthorizedMachine).to.equal(this.VGRContract.address);
    processInstance = await this.ProductionProcessContract.getProcessInstance(
      1
    );
    expect(processInstance[0]).to.equal(ProductDID);
    expect(processInstance[3].toString()).to.equal("0");
    expect(processInstance[4].toString()).to.equal("2");
  });

  it("should authorize MPO when executing step 3", async function () {
    await this.ProductionProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.ProductionProcessContract.step1(1, {
      from: ProcessOwner,
    });
    await this.ProductionProcessContract.step2(1, {
      from: ProcessOwner,
    });
    receipt = await this.ProductionProcessContract.step3(1, {
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
    expect(AuthorizedMachine).to.equal(this.MPOContract.address);
    processInstance = await this.ProductionProcessContract.getProcessInstance(
      1
    );
    expect(processInstance[0]).to.equal(ProductDID);
    expect(processInstance[3].toString()).to.equal("0");
    expect(processInstance[4].toString()).to.equal("3");
  });

  it("should authorize SLD when executing step 4", async function () {
    await this.ProductionProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.ProductionProcessContract.step1(1, {
      from: ProcessOwner,
    });
    await this.ProductionProcessContract.step2(1, {
      from: ProcessOwner,
    });
    await this.ProductionProcessContract.step3(1, {
      from: ProcessOwner,
    });
    receipt = await this.ProductionProcessContract.step4(1, {
      from: ProcessOwner,
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "4",
    });
    expect(AuthorizedMachine).to.equal(this.SLDContract.address);
    processInstance = await this.ProductionProcessContract.getProcessInstance(
      1
    );
    expect(processInstance[0]).to.equal(ProductDID);
    expect(processInstance[3].toString()).to.equal("0");
    expect(processInstance[4].toString()).to.equal("4");
  });

  it("should authorize VGR when executing step 5", async function () {
    await this.ProductionProcessContract.startProcess(ProductDID, {
      from: ProductOwner,
    });
    await this.ProductionProcessContract.step1(1, {
      from: ProcessOwner,
    });
    await this.ProductionProcessContract.step2(1, {
      from: ProcessOwner,
    });
    await this.ProductionProcessContract.step3(1, {
      from: ProcessOwner,
    });
    await this.ProductionProcessContract.step4(1, { from: ProcessOwner });
    await this.SLDContract.finishSorting(1, "white", { from: SLD_DID });
    receipt = await this.ProductionProcessContract.step5(1, {
      from: ProcessOwner,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "5",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(this.VGRContract.address);
    processInstance = await this.ProductionProcessContract.getProcessInstance(
      1
    );
    expect(processInstance[0]).to.equal(ProductDID);
    expect(processInstance[3].toString()).to.equal("0");
    expect(processInstance[4].toString()).to.equal("5");
  });
});
