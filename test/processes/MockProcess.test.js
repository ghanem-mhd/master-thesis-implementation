const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../../utilities/helper')

const MockProcessArtifact = contract.fromArtifact('MockProcess');

describe('MockProcess', function () {
    const [ Owner, MachineContract1, ProductDID1, ProductDID2, ProductDID3, RandomAddress ] = accounts;

    beforeEach(async function () {
        this.MockProcessContract = await MockProcessArtifact.new({from: Owner});
    });

    it('should set machine contract address', async function () {
        await this.MockProcessContract.setMachineContractAddressMock(0, MachineContract1, {from:Owner});
        storedMachineContractAddress = await this.MockProcessContract.getMachineContractAddress(0);
        expect(storedMachineContractAddress).to.equal(MachineContract1);
    });

    it('should increment process ID', async function () {
        await this.MockProcessContract.startMockProcess(ProductDID1, {from:Owner});
        await this.MockProcessContract.startMockProcess(ProductDID2, {from:Owner});
        await this.MockProcessContract.startMockProcess(ProductDID3, {from:Owner});
        ProcessesCount = await this.MockProcessContract.getProcessesCount();
        expect(ProcessesCount.toString()).to.equal("3");
    });

    it('should allow to multiple processes for the same product', async function () {
        await this.MockProcessContract.startMockProcess(ProductDID1, {from:Owner});
        await this.MockProcessContract.startMockProcess(ProductDID1, {from:Owner});
        await this.MockProcessContract.startMockProcess(ProductDID1, {from:Owner});
        ProcessesCount = await this.MockProcessContract.getProcessesCount();
        expect(ProcessesCount.toString()).to.equal("3");
        ProcessIDForProduct1 = await this.MockProcessContract.getProcessID(ProductDID1);
        expect(ProcessIDForProduct1.toString()).to.equal("3");
        ProductForProcess1 = await this.MockProcessContract.getProductDID(1);
        expect(ProductForProcess1.toString()).to.equal(ProductDID1);
        ProductForProcess2 = await this.MockProcessContract.getProductDID(2);
        expect(ProductForProcess2.toString()).to.equal(ProductDID1);
        ProductForProcess3 = await this.MockProcessContract.getProductDID(3);
        expect(ProductForProcess3.toString()).to.equal(ProductDID1);
    });

    it('should revert when getting a process for non existing product', async function () {
        receipt = this.MockProcessContract.getProcessID(RandomAddress);
        await expectRevert(receipt, "No process for the given product.");
    });

    it('should revert when getting a product for non existing process', async function () {
        receipt = this.MockProcessContract.getProductDID(1);
        await expectRevert(receipt, "Process doesn't exists.");
        receipt = this.MockProcessContract.getProductDID(0);
        await expectRevert(receipt, "Process doesn't exists.");
    });

})