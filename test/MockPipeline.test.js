const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')

const MockPipelineArtifact = contract.fromArtifact('MockPipeline');

describe('MockPipeline', function () {
    const [ Owner, MachineContract1, Product ] = accounts;

    beforeEach(async function () {
        this.MockPipelineContract = await MockPipelineArtifact.new({from: Owner});
    });

    it('should set machine contract address', async function () {
        await this.MockPipelineContract.setMachineContractAddressMock(0, MachineContract1, {from:Owner});
        storedMachineContractAddress = await this.MockPipelineContract.getMachineContractAddress(0);
        expect(storedMachineContractAddress).to.equal(MachineContract1);
    });
})