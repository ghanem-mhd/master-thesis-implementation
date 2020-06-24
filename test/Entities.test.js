const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const RoleManager = contract.fromArtifact('RoleManager');
const Entities = contract.fromArtifact('Entities');

describe('Entities', function () {
    const [ admin, nonAdmin, entity1 ] = accounts;

    beforeEach(async function () {
        var roleManagerContract = await RoleManager.new({from: admin});
        this.contract = await Entities.new(roleManagerContract.address, {from: admin});
    });

    it('should let admin add new entity', async function () {
        const receipt = await this.contract.addEntity(entity1, 'Entity 1', { from: admin });
        expectEvent(receipt, 'NewEntityAdded', { entityAddress: entity1, name: 'Entity 1' });
    });

    it('should not let non-admin add new entity', async function () {
        await expectRevert(
            this.contract.addEntity(entity1, 'Entity 1', { from: nonAdmin }), 
            'Caller is not an admin'
        );
    });
})