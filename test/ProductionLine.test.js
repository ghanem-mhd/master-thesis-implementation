const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Product = contract.fromArtifact('Product');
const ProductionLine1 = contract.fromArtifact('ProductionLine1');

describe('ProductionLine1', function () {
    const [ admin, nonAdmin, device1, product1 ] = accounts;

    beforeEach(async function () {
        this.productContract = await Product.new({from: admin});
        this.productionLine1Contract = await ProductionLine1.new({from: admin});
        await this.productionLine1Contract.setProductContractAddress(this.productContract.address, {from: admin});
    });

    it('should return the address of product contract', async function () {
        const acutalProductContractAddresss = await this.productionLine1Contract.getProductContractAddress();
        expect(acutalProductContractAddresss).to.equal(this.productContract.address);
    });

    it('should assign a device to task 1', async function () {
        await this.productionLine1Contract.assignTask(1, device1, {from: admin});
        const acutalDeviceAssingedToTaks1 = await this.productionLine1Contract.getDeviceAssinged(1);
        expect(acutalDeviceAssingedToTaks1).to.equal(device1);
    });

    it('should create product', async function () {
        await this.productionLine1Contract.createProduct(product1, {from: admin});
        const productOwner = await this.productContract.ownerOfProduct(product1);
        expect(productOwner).to.equal(admin);
    });

    it('should generic execute task 1', async function () {
        await this.productionLine1Contract.assignTask(1, device1, {from: admin});
        await this.productionLine1Contract.createProduct(product1, {from: admin});
        await this.productContract.approveProduct(this.productionLine1Contract.address,product1, {from: admin});
        await this.productionLine1Contract.executeTask(product1, 1, {from: admin});
        const productOwner = await this.productContract.ownerOfProduct(product1);
        expect(productOwner).to.equal(device1);
    });
})