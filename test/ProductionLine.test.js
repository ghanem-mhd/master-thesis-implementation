const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const ProductionLine = contract.fromArtifact('ProductionLine');

describe('ProductionLine', function () {
    const [ owner,machine1 ] = accounts;

    beforeEach(async function () {
        this.contract = await ProductionLine.new({ from: owner });
    });

    it('retrieve returns a value previously stored', async function () {
        test = await this.contract.setMachine(machine1, "M1", { from: owner });
        //console.log(test)
    });


    it('getMachinesCount', async function () {
        expect(await this.contract.countMachines()).to.bignumber.equal(new BN('0'));
    });
})