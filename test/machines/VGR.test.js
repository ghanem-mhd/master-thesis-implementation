const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper")

const ProductArtifact = contract.fromArtifact("Product");
const VGRArtifact = contract.fromArtifact("VGR");

describe("VGR", function () {
    const [Admin, VGROwner, MachineID, Product, anyone, Manufacturer, ProductOwner ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});

        await this.ProductContract.createProduct(ProductOwner, Product);
        this.VGRContract = await VGRArtifact.new(VGROwner, MachineID, this.ProductContract.address, {from: VGROwner});

        await this.ProductContract.authorizeMachine(this.VGRContract.address, Product, {from: ProductOwner});
        await this.VGRContract.authorizeManufacturer(Manufacturer, {from:VGROwner});
    });

    it("should start GetInfo task with correct input", async function () {
        NewTaskEvent = await this.VGRContract.getInfo(Product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "GetInfo", productDID:Product});
    });

    it("should save output of the GetInfo task", async function () {
        await this.VGRContract.getInfo(Product, {from:Manufacturer});
        await this.VGRContract.finishGetInfo(1, "123", "White", {from: MachineID});

        StoredProductOperations = await this.VGRContract.getProductOperations(Product);
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

    it("should start HBWDrop task with correct input", async function () {
        NewTaskEvent = await this.VGRContract.dropToHBW(Product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "DropToHBW", productDID:Product});
    });


    it("should start MoveHBW2MPO task with correct input", async function () {
        NewTaskEvent = await this.VGRContract.moveHBW2MPO(Product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "MoveHBW2MPO", productDID:Product});
    });

    it("should start PickSorted task with correct input", async function () {
        NewTaskEvent = await this.VGRContract.pickSorted(Product, "orange", {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "PickSorted", productDID:Product});
        StoredInputValue = await this.VGRContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });

})