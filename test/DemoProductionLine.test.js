const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const web3 = require('web3');

const Product = contract.fromArtifact('Product');
const DemoProductionLine = contract.fromArtifact('DemoProductionLine');

describe('DemoProductionLine', function () {
    const [ admin, nonAdmin, machine1, machine2, machine3, machine4, product1 ] = accounts;

    function toByteArray(string){
        hex =  web3.utils.asciiToHex(string)
        bytes =  web3.utils.hexToBytes(hex)
        return bytes
    }

    beforeEach(async function () {
        this.productContract = await Product.new({from: admin});
        this.demoProductionLineContract = await DemoProductionLine.new({from: admin});
        await this.demoProductionLineContract.setProductContractAddress(this.productContract.address, {from: admin});
        await this.demoProductionLineContract.assignWarehouseTask(machine1 , {from:admin})
        await this.demoProductionLineContract.assignTransferTask(machine2 , {from:admin})
        await this.demoProductionLineContract.assignMainTask(machine3 , {from:admin})
        await this.demoProductionLineContract.assignSortingTask(machine4 , {from:admin})
    });

    it('should execute demo production pipeline', async function () {
        await this.demoProductionLineContract.createDemoProduct(product1, "color", {from: admin});
        await this.demoProductionLineContract.finishWarehouseTask(product1, "1" , {from: machine1});
        await this.demoProductionLineContract.finishTransferTask(product1, "2" , {from: machine2});
        await this.demoProductionLineContract.finishMainTask(product1, "3" , {from: machine3});
        await this.demoProductionLineContract.finishTransferTask(product1, "4" , {from: machine2});
        await this.demoProductionLineContract.finishSortingTask(product1, "5" , "Big", {from: machine4});
    });


})