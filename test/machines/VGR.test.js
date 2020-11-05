const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper")

const ProductArtifact = contract.fromArtifact("Product");
const VGRArtifact = contract.fromArtifact("VGR");

describe("VGR_Machine", function () {
    const [Admin, VGROwner, MachineDID, ProductDID, anyone, Manufacturer, ProductOwner ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});

        await this.ProductContract.createProduct(ProductDID, {from:ProductOwner});
        this.VGRContract = await VGRArtifact.new(VGROwner, MachineDID, this.ProductContract.address, {from: VGROwner});

        await this.ProductContract.authorizeMachine(MachineDID, ProductDID, {from: ProductOwner});
        await this.VGRContract.authorizeManufacturer(Manufacturer, {from:VGROwner});
    });

    it("should accept a GetInfo task", async function () {
        receipt = await this.VGRContract.assignGetInfoTask(1, ProductDID, {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"GetInfo", productDID:ProductDID, processID: "1", processContractAddress:Manufacturer });
    });

    it("should save the operation of the GetInfo task", async function () {
        receipt = await this.VGRContract.assignGetInfoTask(1, ProductDID, {from:Manufacturer});
        await this.VGRContract.startTask(1, {from: MachineDID});
        receipt = await this.VGRContract.finishGetInfoTask(1, "123", "White", {from: MachineDID});

        expectEvent(receipt, "ProductOperationSaved", {operationID:"2", taskID: "1", productDID:ProductDID, operationName: "ColorDetection", operationResult:"White" });
        expectEvent(receipt, "ProductOperationSaved", {operationID:"1", taskID: "1", productDID:ProductDID, operationName: "NFCTagReading", operationResult:"123" });

        StoredProductOperations = await this.VGRContract.getProductOperations(ProductDID);
        expect(StoredProductOperations[0].toString()).to.equal("1");
        expect(StoredProductOperations[1].toString()).to.equal("2");

        StoredProductOperation1 = await this.VGRContract.getProductOperation(1);
        expect(StoredProductOperation1[0]).to.equal(this.VGRContract.address);
        expect(StoredProductOperation1[1].toString()).to.equal("1");
        expect(StoredProductOperation1[3]).to.equal("NFCTagReading");
        expect(StoredProductOperation1[4]).to.equal("123");

        StoredProductOperation2 = await this.VGRContract.getProductOperation(2);
        expect(StoredProductOperation2[0]).to.equal(this.VGRContract.address);
        expect(StoredProductOperation2[1].toString()).to.equal("1");
        expect(StoredProductOperation2[3]).to.equal("ColorDetection");
        expect(StoredProductOperation2[4]).to.equal("White");
    });

    it("should accept a DropToHBW task", async function () {
        receipt = await this.VGRContract.assignDropToHBWTask(1, ProductDID, {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"DropToHBW", productDID:ProductDID, processID: "1", processContractAddress:Manufacturer });
    });

    it("should accept a MoveHBW2MPO task", async function () {
        receipt = await this.VGRContract.assignMoveHBW2MPOTask(1, ProductDID, {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"MoveHBW2MPO", productDID:ProductDID, processID: "1", processContractAddress:Manufacturer });
    });

    it("should accept a PickSorted task", async function () {
        receipt = await this.VGRContract.assignPickSortedTask(1, ProductDID, "orange", {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"PickSorted", productDID:ProductDID, processID: "1", processContractAddress:Manufacturer });
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });

})