// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/RoleManager.sol";


contract Machines {

	struct Machine{
		string name;
	}

	mapping (address => Machine) machines;
    address[] public machineIds;
    RoleManager public roleManager;

    constructor(RoleManager addr) public {
        roleManager = addr;
    }


	function addMachine(address id, string memory name) public {
        require(roleManager.hasRole(roleManager.MANUFACTURER_ROLE(), msg.sender), "Caller is not a manfacteurer");
        machines[id] = Machine(name);
        machineIds.push(id);
    }

	function getMachinesIds() public view returns(address[] memory) {
        return machineIds;
    }

	function getMachine(address machineId) public view returns (string memory name) {
        return (machines[machineId].name);
    }

    function getMachinesCount() public view returns (uint) {
        return machineIds.length;
    }
}