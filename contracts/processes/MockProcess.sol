// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";

contract MockProcess is Process {

    enum Machines {Machine1, Machine2 }

    function setMachineContractAddressMock(uint machineID, address machineContractAddress) public {
        super.setMachineContractAddress(machineID, machineContractAddress);
    }

    function startMockProcess(address productDID) public {
        super.startProcess(productDID);
    }
}