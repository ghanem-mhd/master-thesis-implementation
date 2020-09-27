const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')
const ProductArtifact = contract.fromArtifact('Product');

describe('ProductContract', function () {
    const [ Admin, Owner, ProductDID1, ProductDID2, MachineDID ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});
    });

    it('should create a new product', async function () {
        TransferEvent = await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        expectEvent(TransferEvent, "Transfer", {from: constants.ZERO_ADDRESS, to: Owner, tokenId: "1"});
    });

    it('should create one product for DID', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        receipt = this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        await expectRevert(receipt, "Product already exist.");
    });

    it('should get the owner of a product', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        AcutalProductOwner = await this.ProductContract.ownerOfProduct(ProductDID1);
        expect(AcutalProductOwner).to.equal(Owner);
    });

    it('should revert for non existing product', async function () {
        receipt = this.ProductContract.ownerOfProduct(ProductDID1);
        await expectRevert(receipt, "Product doesn't exist.");
    });

    it('should authorize a machine', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        ApprovalEvent = await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: Owner});
        expectEvent(ApprovalEvent, "Approval", {owner: Owner, approved: MachineDID, tokenId: "1"});
    });

    it('should unauthorize a machine', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        ApprovalEvent = await this.ProductContract.unauthorizeCurrentMachine(ProductDID1, {from: Owner});
        expectEvent(ApprovalEvent, "Approval", {owner: Owner, approved: constants.ZERO_ADDRESS, tokenId: "1"});
    });

    it('should get DID of the approved machine', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: Owner});
        AcutalMachineDID = await this.ProductContract.getApprovedMachine(ProductDID1);
        expect(AcutalMachineDID).to.equal(MachineDID);
    });

    it('should get products count', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        await this.ProductContract.createProduct(Owner, ProductDID2, {from:Admin});
        AcutalProductCount = await this.ProductContract.getProductsCount();
        expect(AcutalProductCount.toString()).to.equal("2");
    });

    it('should save product operation for an approved machine', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: Owner});
        await this.ProductContract.saveProductOperation(ProductDID1, 1, "OperationName", "OperationResult", {from: MachineDID});
        StoredProductOperations = await this.ProductContract.getProductOperations(ProductDID1);
        expect(StoredProductOperations[0].toString()).to.equal("1");
        StoredOperation = await this.ProductContract.getProductOperation(1);
        expect(StoredOperation[0]).to.equal(MachineDID);
        expect(StoredOperation[1].toString()).to.equal("1");
        expect(StoredOperation[3]).to.equal("OperationName");
        expect(StoredOperation[4]).to.equal("OperationResult");
    });

    it('should revert when saving product operation from unapproved machine', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        receipt = this.ProductContract.saveProductOperation(ProductDID1, 1, "OperationName", "OperationResult", {from: MachineDID});
        await expectRevert(receipt, "Sender is not approved for this operation.");
    });

    it('should set the physical ID of a product', async function () {
        await this.ProductContract.createProduct(Owner, ProductDID1, {from:Admin});
        await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: Owner});
        await this.ProductContract.saveIdentificationOperation(ProductDID1, 100, "ID1111", {from: MachineDID});
        StoredProductDID = await this.ProductContract.getProductFromPhysicalID("ID1111");
        expect(StoredProductDID).to.equal(ProductDID1);
        StoredProductOperations = await this.ProductContract.getProductOperations(ProductDID1);
        expect(StoredProductOperations[0].toString()).to.equal("1");
        StoredOperation = await this.ProductContract.getProductOperation(1);
        expect(StoredOperation[0]).to.equal(MachineDID);
        expect(StoredOperation[1].toString()).to.equal("100");
        expect(StoredOperation[3]).to.equal("Physical Identification");
        expect(StoredOperation[4]).to.equal("ID1111");
    });
})