const { accounts, contract } = require("@openzeppelin/test-environment");
const { BN, constants ,expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Helper = require("../../utilities/helper")

const ProductArtifact = contract.fromArtifact("Product");
const HBWArtifact = contract.fromArtifact("HBW");

describe("HBW_Machine", function () {
    const [Admin, HBWOwner, MachineID, ProductDID, anyone, Manufacturer ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});

        this.HBWContract = await HBWArtifact.new(HBWOwner, MachineID, this.ProductContract.address, {from: HBWOwner});
        await this.HBWContract.authorizeManufacturer(Manufacturer, {from:HBWOwner});
    });

    it("should accept a FetchContainer task", async function () {
        receipt = await this.HBWContract.assignFetchContainerTask(1, {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"FetchContainer", productDID:constants.ZERO_ADDRESS, processID: "1", processContractAddress:Manufacturer });
    });

    it("should accept a StoreContainer task", async function () {
        receipt = await this.HBWContract.assignStoreContainerTask(1, {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"StoreContainer", productDID:constants.ZERO_ADDRESS, processID: "1", processContractAddress:Manufacturer });
    });

    it("should accept a StoreProduct task", async function () {
        receipt = await this.HBWContract.assignStoreProductTask(1, ProductDID, "123", "orange", {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"StoreProduct", productDID:ProductDID, processID: "1", processContractAddress:Manufacturer });
        StoredInputValue = await this.HBWContract.getTaskInput(1, Helper.toHex("id"));
        expect(StoredInputValue, "123");
        StoredInputValue = await this.HBWContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });

    it("should accept a FetchProduct task", async function () {
        receipt = await this.HBWContract.assignFetchProductTask(1, "orange", {from:Manufacturer});
        expectEvent(receipt, "TaskAssigned", { taskID: "1", taskName:"FetchProduct", productDID:constants.ZERO_ADDRESS, processID: "1", processContractAddress:Manufacturer });
        StoredInputValue = await this.HBWContract.getTaskInput(1, Helper.toHex("color"));
        expect(StoredInputValue, "orange");
    });
})