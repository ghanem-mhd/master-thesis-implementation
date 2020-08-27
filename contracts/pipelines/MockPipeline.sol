// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Pipeline.sol";

contract MockPipeline is Pipeline {

    enum Machines {Machine1, Machine2 }

    function setMachineContractAddressMock(uint machineID, address machineContractAddress) public {
        super.setMachineContractAddress(machineID, machineContractAddress);
    }

    function newMockInstance() public {
        super.newInstance();
    }
}