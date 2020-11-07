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

const ProductArtifact = contract.fromArtifact("Product");
const VGRArtifact = contract.fromArtifact("VGR");
const HBWArtifact = contract.fromArtifact("HBW");
const SupplyingProcessArtifact = contract.fromArtifact("SupplyingProcess");

describe("SupplyingProcess", function () {
  const [
    Admin,
    Manufacturer,
    VGR_DID,
    HBW_DID,
    ProductDID,
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
    this.SupplyingProcessContract = await SupplyingProcessArtifact.new(
      Manufacturer,
      this.ProductContract.address,
      { from: Admin }
    );

    this.ProcessContractAddress = this.SupplyingProcessContract.address;
    await this.VGRContract.authorizeManufacturer(Manufacturer, {
      from: Admin,
    });
    await this.HBWContract.authorizeManufacturer(Manufacturer, {
      from: Admin,
    });
    await this.SupplyingProcessContract.setVGRContractAddress(
      this.VGRContract.address,
      { from: Manufacturer }
    );
    await this.SupplyingProcessContract.setHBWContractAddress(
      this.HBWContract.address,
      { from: Manufacturer }
    );
  });

  it("should authorize VGR when starting the supplying process", async function () {
    await this.SupplyingProcessContract.startSupplyingProcess(ProductDID, {
      from: Manufacturer,
    });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(VGR_DID);
  });

  it("should authorize none when executing step 2", async function () {
    await this.SupplyingProcessContract.startSupplyingProcess(ProductDID, {
      from: Manufacturer,
    });
    await this.SupplyingProcessContract.step2(1, { from: Manufacturer });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(constants.ZERO_ADDRESS);
  });

  it("should authorize VGR when executing step 3", async function () {
    await this.SupplyingProcessContract.startSupplyingProcess(ProductDID, {
      from: Manufacturer,
    });
    await this.SupplyingProcessContract.step3(1, { from: Manufacturer });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(VGR_DID);
  });

  it("should authorize HBW when executing step 4 and check get info operations", async function () {
    await this.SupplyingProcessContract.startSupplyingProcess(ProductDID, {
      from: Manufacturer,
    });
    await this.VGRContract.finishGetInfoTask(1, "1234", "white", {
      from: VGR_DID,
    });
    await this.SupplyingProcessContract.step4(1, { from: Manufacturer });
    AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(
      ProductDID
    );
    expect(AuthorizedMachine).to.equal(HBW_DID);
  });
});
