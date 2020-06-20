// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/BaseContract.sol";


contract ProductionLine is BaseContract {

	struct Machine{
		address id;
		string name;
	}

	mapping (address => Machine) machines;
    address[] public machinesAccounts;

	function setMachine(address _address, string memory name) public {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Caller is not a manfacteurer");
        machines[_address] = Machine(_address, name);
        machinesAccounts.push(_address);
    }

	function getMachinesAccounts() public view returns(address[] memory) {
        return machinesAccounts;
    }

	function getMachine(address _address) public view returns (address id, string memory name) {
        return (machines[_address].id, machines[_address].name);
    }

    function countMachines() public view returns (uint) {
        return machinesAccounts.length;
    }
}