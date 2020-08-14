const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const web3 = require('web3');

const Product = contract.fromArtifact('Product');
const DemoProductionLine = contract.fromArtifact('DemoProductionLine');

describe('DemoProductionLine', function () {
    const [ admin, nonAdmin, device1, device2, device3, device4, product1 ] = accounts;

    function toByteArray(string){
        hex =  web3.utils.asciiToHex(string)
        bytes =  web3.utils.hexToBytes(hex)
        return bytes
    }

    beforeEach(async function () {
        this.productContract = await Product.new({from: admin});
        this.demoProductionLineContract = await DemoProductionLine.new({from: admin});
        await this.demoProductionLineContract.setProductContractAddress(this.productContract.address, {from: admin});
        await this.demoProductionLineContract.assignWarehouseTask(device1 , {from:admin})
        await this.demoProductionLineContract.assignTransferTask(device2 , {from:admin})
        await this.demoProductionLineContract.assignMainTask(device3 , {from:admin})
        await this.demoProductionLineContract.assignSortingTask(device4 , {from:admin})
    });

    it('should execute demo production pipeline', async function () {
        await this.demoProductionLineContract.createDemoProduct(product1, "color", {from: admin});
        await this.demoProductionLineContract.finishWarehouseTask(product1, "1" , {from: device1});
        await this.demoProductionLineContract.finishTransferTask(product1, "2" , {from: device2});
        await this.demoProductionLineContract.finishMainTask(product1, "3" , {from: device3});
        await this.demoProductionLineContract.finishTransferTask(product1, "4" , {from: device2});
        await this.demoProductionLineContract.finishSortingTask(product1, "5" , "Big", {from: device4});
    });

 
})