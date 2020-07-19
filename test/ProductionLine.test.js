const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const web3 = require('web3');

const Product = contract.fromArtifact('Product');
const MockProductionLine = contract.fromArtifact('MockProductionLine');

describe('ProductionLine', function () {
    const [ admin, nonAdmin, device1, product1 ] = accounts;

    beforeEach(async function () {
        this.productContract = await Product.new({from: admin});
        this.MockProductionLineContract = await MockProductionLine.new({from: admin});
        this.dummyTaskType = await this.MockProductionLineContract.DUMMY_TASK_TYPE();
        await this.MockProductionLineContract.setProductContractAddress(this.productContract.address, {from: admin});
    });

    it('should return the address of product contract', async function () {
        const acutalProductContractAddress = await this.MockProductionLineContract.getProductContractAddress();
        expect(acutalProductContractAddress).to.equal(this.productContract.address);
    });

    it('should assign a device to Dummy Task type', async function () {
        const receipt = await this.MockProductionLineContract.assignDummyTask(device1, {from: admin});
        expectEvent(receipt, 'TaskTypeAssigned', { device: device1, taskType: this.dummyTaskType, status: true });
        const acutalDeviceAssignedToTask = await this.MockProductionLineContract.getDeviceAssigned(this.dummyTaskType);
        expect(acutalDeviceAssignedToTask).to.equal(device1);
    });

    it('should create product', async function () {
        const receipt = await this.MockProductionLineContract.createDummyProduct(product1, {from: admin});
        expectEvent(receipt, 'ProductCreated', { product: product1, creator: admin });
        const currentProductOwner = await this.productContract.ownerOfProduct(product1);
        expect(currentProductOwner).to.equal(this.MockProductionLineContract.address);
    });

    it('should start Dummy Task', async function () {
        await this.MockProductionLineContract.assignDummyTask(device1, {from: admin});
        await this.MockProductionLineContract.createDummyProduct(product1, {from: admin});
        var receipt = await this.MockProductionLineContract.startDummyTask(product1, {from: admin});
        expectEvent(receipt, 'NewTask', { device: device1, product: product1, taskId: "1" });
        const currentApprovedDevice = await this.productContract.getApprovedDevice(product1);
        expect(currentApprovedDevice).to.equal(device1);
    });      

    it('should finish Dummy Task', async function () {
        await this.MockProductionLineContract.assignDummyTask(device1, {from: admin});
        await this.MockProductionLineContract.createDummyProduct(product1, {from: admin});
        await this.MockProductionLineContract.startDummyTask(product1, {from: admin});
        await this.MockProductionLineContract.finishDummyTask(product1, 1, {from: device1});
        const currentApprovedDevice = await this.productContract.getApprovedDevice(product1);
        expect(currentApprovedDevice).to.equal(constants.ZERO_ADDRESS);
    });

    it('should get correct params', async function () {
        await this.MockProductionLineContract.assignDummyTask(device1, {from: admin});
        await this.MockProductionLineContract.createDummyProduct(product1, {from: admin});
        await this.MockProductionLineContract.startDummyTask(product1, {from: admin});
        await this.MockProductionLineContract.finishDummyTask(product1, 1, {from: device1});

        var receipt = await this.MockProductionLineContract.getTask(1, {from: device1});
        
        //'0x636f6c6f72000000000000000000000000000000000000000000000000000000'
        var param1Name = web3.utils.padRight(web3.utils.asciiToHex("color"), 64)
        // '0x73697a6500000000000000000000000000000000000000000000000000000000'
        var param2Name = web3.utils.padRight(web3.utils.asciiToHex("size"), 64)

        expect(receipt[0]).to.equal(device1);
        expect(receipt[1]).to.equal(product1);
        expect(receipt[2]).to.equal(this.dummyTaskType);
        expect(receipt[5]).to.deep.equal([param1Name, param2Name ]);
        
        var receipt = await this.MockProductionLineContract.getTaskParameter(1,param1Name, {from: device1});
        expect(receipt).to.equal(web3.utils.padRight(web3.utils.asciiToHex("Red"), 64));
        receipt = await this.MockProductionLineContract.getTaskParameter(1,param2Name, {from: device1});
        expect(receipt).to.equal(web3.utils.padRight(web3.utils.asciiToHex("Big"), 64));     
    });
})