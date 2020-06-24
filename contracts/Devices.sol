// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/RoleManager.sol";


contract Devices {

	struct Device{
		string name;
	}

	mapping (address => Device) devices;
    address[] public deviceIds;
    RoleManager public roleManager;

    constructor(RoleManager addr) public {
        roleManager = addr;
    }


	function addDevice(address id, string memory name) public {
        require(roleManager.hasRole(roleManager.MANUFACTURER_ROLE(), msg.sender), "Caller is not a manfacteurer");
        devices[id] = Device(name);
        deviceIds.push(id);
    }

	function getDevicesIds() public view returns(address[] memory) {
        return deviceIds;
    }

	function getDevice(address deviceId) public view returns (string memory name) {
        return (devices[deviceId].name);
    }

    function getDevicesCount() public view returns (uint) {
        return deviceIds.length;
    }
}