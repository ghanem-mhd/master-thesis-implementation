const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')
const ProductArtifact = contract.fromArtifact('Product');

describe('Product', function () {
    const [ Admin, Owner, ProductDID1, ProductDID2, MachineDID, ManufacturerDID, NotOwner ] = accounts;

    beforeEach(async function () {
        this.ProductContract = await ProductArtifact.new({from: Admin});
    });

    it('should create one product for DID', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        receipt = this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await expectRevert(receipt, "Product already exist.");
    });

    it('should get the owner of a product', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        AcutalProductOwner = await this.ProductContract.ownerOfProduct(ProductDID1);
        expect(AcutalProductOwner).to.equal(Owner);
    });

    it('should revert for non existing product', async function () {
        receipt = this.ProductContract.ownerOfProduct(ProductDID1);
        await expectRevert(receipt, "Product doesn't exist.");
    });

    it('should get products count', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await this.ProductContract.createProduct(ProductDID2, {from:Admin});
        AcutalProductCount = await this.ProductContract.getProductsCount();
        expect(AcutalProductCount.toString()).to.equal("2");
    });

    it('should let owner authorize a manufacturer', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await this.ProductContract.authorizeManufacturer(ManufacturerDID, ProductDID1, {from: Owner});
        AuthorizedManufacturer = await this.ProductContract.getAuthorizeManufacturer(ProductDID1);
        expect(AuthorizedManufacturer).to.equal(ManufacturerDID);
    });

    it('should revert when non owner authorize a manufacturer', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        receipt = this.ProductContract.authorizeManufacturer(ManufacturerDID, ProductDID1, {from: NotOwner});
        await expectRevert(receipt, "Only product owner can call this function.");
    });

    it('should unauthorize a manufacturer', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await this.ProductContract.unauthorizeCurrentManufacturer(ProductDID1, {from: Owner});
        AuthorizedManufacturer = await this.ProductContract.getAuthorizeManufacturer(ProductDID1);
        expect(AuthorizedManufacturer).to.equal(constants.ZERO_ADDRESS);
        receipt = this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: ManufacturerDID});
        await expectRevert(receipt, "Only authorize manufacturer can call this function.");
    });

    it('should let the authorized manufacturer to authorize a machine', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await this.ProductContract.authorizeManufacturer(ManufacturerDID, ProductDID1, {from: Owner});
        await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: ManufacturerDID});
        AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(ProductDID1);
        expect(AuthorizedMachine).to.equal(MachineDID);
    });

    it('should revert when non owner authorized manufacturer authorize a machine', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        receipt = this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: ManufacturerDID});
        await expectRevert(receipt, "Only authorize manufacturer can call this function.");
    });

    it('should unauthorize a machine', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        ApprovalEvent = await this.ProductContract.unauthorizeCurrentMachine(ProductDID1, {from: Owner});
        AuthorizedMachine = await this.ProductContract.getAuthorizedMachine(ProductDID1);
        expect(AuthorizedMachine).to.equal(constants.ZERO_ADDRESS);
        receipt = this.ProductContract.saveProductOperation(ProductDID1, 1, "OperationName", "OperationResult", {from: MachineDID});
        await expectRevert(receipt, "Only authorize machine can call this function.");
    });

    it('should save product operation for an approved machine', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
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
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        receipt = this.ProductContract.saveProductOperation(ProductDID1, 1, "OperationName", "OperationResult", {from: MachineDID});
        await expectRevert(receipt, "Only authorize machine can call this function.");
    });

    it('should set the physical ID of a product', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
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

    it('should get operation result for a certain product', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: Owner});
        await this.ProductContract.saveProductOperation(ProductDID1, 1, "OperationName", "OperationResult1005", {from: MachineDID});
        OperationResult = await this.ProductContract.getProductOperationResult(ProductDID1, "OperationName");
        expect(OperationResult).to.equal("OperationResult1005");
    });

    it('should revert when getting an operation result for non existing operation', async function () {
        await this.ProductContract.createProduct(ProductDID1, {from:Owner});
        await this.ProductContract.authorizeMachine(MachineDID, ProductDID1, {from: Owner});
        receipt = this.ProductContract.getProductOperationResult(ProductDID1, "OperationName");
        await expectRevert(receipt, "Operation doesn't exists.");
    });

})