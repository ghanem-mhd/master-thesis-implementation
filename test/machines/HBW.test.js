const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper")

const ProductArtifact = contract.fromArtifact("Product");
const HBWArtifact = contract.fromArtifact("HBW");

describe("HBW", function () {
    const [Admin, HBWOwner, MachineID, product, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});

        this.HBWContract = await HBWArtifact.new(HBWOwner, MachineID, this.ProductContract.address, {from: HBWOwner});
        await this.HBWContract.authorizeManufacturer(Manufacturer, {from:HBWOwner});
    });

    it("should start FetchContainer task with correct input", async function () {
        NewTaskEvent = await this.HBWContract.fetchContainer(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "FetchContainer", productDID:product});
    });

    it("should start StoreContainer task with correct input", async function () {
        NewTaskEvent = await this.HBWContract.storeContainer(product, {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "StoreContainer", productDID:product});
    });

    it("should start StoreWB task with correct input", async function () {
        NewTaskEvent = await this.HBWContract.storeWB(product, "123", "orange", {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "StoreWB", productDID:product});
        StoredInputValue = await this.HBWContract.getTaskInput(1, Helper.toHex("id"));
        expect(StoredInputValue, "123");
        StoredInputValue = await this.HBWContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });

    it("should start FetchWB task with correct input", async function () {
        NewTaskEvent = await this.HBWContract.fetchWB(product, "orange", {from:Manufacturer});
        expectEvent(NewTaskEvent, "NewTask", {taskID: "1", taskName: "FetchWB", productDID:product});
        StoredInputValue = await this.HBWContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });
})