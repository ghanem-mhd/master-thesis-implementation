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
    Manufacturer,
    ProductOwner,
  ] = accounts;

  beforeEach(async function () {
    this.ProductContract = await ProductArtifact.new({ from: Admin });
    await this.ProductContract.createProduct(ProductDID, {
      from: ProductOwner,
    });
    await this.ProductContract.authorizeManufacturer(Manufacturer, ProductDID, {
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
      Manufacturer,
      this.ProductContract.address,
      { from: Admin }
    );

    await this.VGRContract.authorizeManufacturer(Manufacturer, {
      from: Admin,
    });
    await this.HBWContract.authorizeManufacturer(Manufacturer, {
      from: Admin,
    });
    await this.MPOContract.authorizeManufacturer(Manufacturer, {
      from: Admin,
    });
    await this.SLDContract.authorizeManufacturer(Manufacturer, {
      from: Admin,
    });
    await this.ProductionProcessContract.setVGRContractAddress(
      this.VGRContract.address,
      { from: Manufacturer }
    );
    await this.ProductionProcessContract.setHBWContractAddress(
      this.HBWContract.address,
      { from: Manufacturer }
    );
    await this.ProductionProcessContract.setMPOContractAddress(
      this.MPOContract.address,
      { from: Manufacturer }
    );
    await this.ProductionProcessContract.setSLDContractAddress(
      this.SLDContract.address,
      { from: Manufacturer }
    );
  });

  it("should authorize HBW when starting the production process", async function () {
    receipt = await this.ProductionProcessContract.startProductionProcess(
      ProductDID,
      {
        from: Manufacturer,
      }
    );
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "1",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(HBW_DID);
  });

  it("should authorize VGR when executing step 2", async function () {
    await this.ProductionProcessContract.startProductionProcess(ProductDID, {
      from: Manufacturer,
    });
    receipt = await this.ProductionProcessContract.step2(1, {
      from: Manufacturer,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "2",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(VGR_DID);
  });

  it("should authorize MPO when executing step 3", async function () {
    await this.ProductionProcessContract.startProductionProcess(ProductDID, {
      from: Manufacturer,
    });
    receipt = await this.ProductionProcessContract.step3(1, {
      from: Manufacturer,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "3",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(MPO_DID);
  });

  it("should authorize SLD when executing step 4", async function () {
    await this.ProductionProcessContract.startProductionProcess(ProductDID, {
      from: Manufacturer,
    });
    receipt = await this.ProductionProcessContract.step4(1, {
      from: Manufacturer,
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "4",
    });
    expect(AuthorizedMachine).to.equal(SLD_DID);
  });

  it("should authorize VGR when executing step 5", async function () {
    await this.ProductionProcessContract.startProductionProcess(ProductDID, {
      from: Manufacturer,
    });
    await this.ProductionProcessContract.step4(1, { from: Manufacturer });
    await this.SLDContract.finishSorting(1, "white", { from: SLD_DID });
    receipt = await this.ProductionProcessContract.step5(1, {
      from: Manufacturer,
    });
    expectEvent(receipt, "ProcessStepStarted", {
      processID: "1",
      productDID: ProductDID,
      step: "5",
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(VGR_DID);
  });

  it("should get the VGR address", async function () {
    receipt = await this.ProductionProcessContract.VGRContract();
    expect(receipt).to.equal(this.VGRContract.address);
  });
});
