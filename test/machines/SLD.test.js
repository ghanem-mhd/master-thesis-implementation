const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper")

const ProductArtifact = contract.fromArtifact("Product");
const SLDArtifact = contract.fromArtifact("SLD");

describe("SLD", function () {
    const [Admin, SLDOwner, SLD_DID, Product, anyone, Manufacturer, ProductOwner ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});

        await this.ProductContract.createProduct(ProductOwner, Product);
        this.SLDContract = await SLDArtifact.new(SLDOwner, SLD_DID, this.ProductContract.address, {from: SLDOwner});

        await this.ProductContract.authorizeMachine(this.SLDContract.address, Product, {from: ProductOwner});
        await this.SLDContract.authorizeManufacturer(Manufacturer, {from:SLDOwner});
    });

    it("should start Sort task with correct input", async function () {
        NewTaskEvent = await this.SLDContract.sort(Product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "Sort", productDID:Product});
    });

    it("should save the operation of the Sort task", async function () {
        await this.SLDContract.sort(Product, {from:Manufacturer});
        await this.SLDContract.finishSorting(1, "Pink", {from: SLD_DID});
        StoredProductOperations = await this.SLDContract.getProductOperations(Product);
        expect(StoredProductOperations[0].toString()).to.equal("1");
        StoredProductOperation = await this.SLDContract.getProductOperation(1);
        expect(StoredProductOperation[0]).to.equal(this.SLDContract.address);
        expect(StoredProductOperation[1].toString()).to.equal("1");
        expect(StoredProductOperation[3]).to.equal("ColorDetection");
        expect(StoredProductOperation[4]).to.equal("Pink");
    });

    it("should create an issue if brightness below 70 ", async function () {
        var receipt = await this.SLDContract.saveReadingSLD(0, 4, 66, {from: SLD_DID});
        expectEvent(receipt, "NewIssue", { issueID: "1", reason: "Brightness is too low", issueType:"Major"});
        var savedIssue = await this.SLDContract.getIssue(1);
        expect(savedIssue[1].toString()).to.equal("1");
        expect(savedIssue[2].toString()).to.equal("Brightness is too low");
        expect(savedIssue[3].toString()).to.equal("Major");
    });
})