const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, constants ,expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Helper = require('../utilities/helper')

const MockPipelineArtifact = contract.fromArtifact('MockPipeline');

describe('MockPipeline', function () {
    const [ Owner, MachineContract1 ] = accounts;

    beforeEach(async function () {
        this.MockPipelineContract = await MockPipelineArtifact.new({from: Owner});
    });

    it('should set machine contract address', async function () {
        await this.MockPipelineContract.setMachineContractAddressMock(0, MachineContract1, {from:Owner});
        storedMachineContractAddress = await this.MockPipelineContract.getMA(0);
        expect(storedMachineContractAddress).to.equal(MachineContract1);
    });

    it('create new pipeline instance', async function () {
        await this.MockPipelineContract.newMockInstance({from:Owner});
        numberOfInstance = await this.MockPipelineContract.getInstanceCount();
        expect(numberOfInstance.toString()).to.equal("1");
    });

})