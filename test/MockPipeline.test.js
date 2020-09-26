const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')

const MockProcessArtifact = contract.fromArtifact('MockProcess');

describe('MockProcess', function () {
    const [ Owner, MachineContract1, Product ] = accounts;

    beforeEach(async function () {
        this.MockProcessContract = await MockProcessArtifact.new({from: Owner});
    });

    it('should set machine contract address', async function () {
        await this.MockProcessContract.setMachineContractAddressMock(0, MachineContract1, {from:Owner});
        storedMachineContractAddress = await this.MockProcessContract.getMachineContractAddress(0);
        expect(storedMachineContractAddress).to.equal(MachineContract1);
    });
})