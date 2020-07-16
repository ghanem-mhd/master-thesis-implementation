const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Product = contract.fromArtifact('Product');
const DemoProductionLine = contract.fromArtifact('DemoProductionLine');

describe('DemoProductionLine', function () {
    const [ admin, nonAdmin, device1, product1 ] = accounts;

    beforeEach(async function () {
        this.productContract = await Product.new({from: admin});
        this.demoProductionLineContract = await DemoProductionLine.new({from: admin});
        await this.demoProductionLineContract.setProductContractAddress(this.productContract.address, {from: admin});
    });

    it('test', async function () {
        await this.demoProductionLineContract.assignWarehouseTask(device1 , {from:admin})
        const receipt = await this.demoProductionLineContract.createDemoProduct(product1, "Red" , {from: admin});
        expectEvent(receipt, 'ProductCreated', { product: product1, creator: admin });
    });

 
})