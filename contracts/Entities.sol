// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/RoleManager.sol";


contract Entities {

	struct Entity{
	    string name;
	}

	mapping(address => Entity) entities;
    address[] public entitiesAddresses;
    RoleManager public roleManager;

    event NewEntityAdded(address indexed entityAddress, string name);

    constructor(RoleManager _roleManager) public {
        roleManager = _roleManager;
    }

	function addEntity(address _address, string memory name) public {
        require(roleManager.hasRole(roleManager.ADMIN_ROLE(), msg.sender), "Caller is not an admin");
        entities[_address] = Entity(name);
        entitiesAddresses.push(_address);
        emit NewEntityAdded(_address, name);
    }

	function getEntitiesAddresses() public view returns(address[] memory) {
        return entitiesAddresses;
    }

	function getEntity(address _address) public view returns (string memory name) {
        return (entities[_address].name);
    }

    function getEntitiesCount() public view returns (uint) {
        return entitiesAddresses.length;
    }
}