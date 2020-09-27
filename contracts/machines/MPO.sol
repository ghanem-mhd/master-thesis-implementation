// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract MPO is Machine {

    enum TasksNames { Process }

    constructor(address _machineOwner, address _machineID, address _productContractAddress) Machine(_machineOwner, _machineID, _productContractAddress) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 1);
        if (TasksNames.Process == taskName) return "Process";
    }

    function process(address productID) public {
        uint newTaskID = super.createTask(address(productID), getTaskName(TasksNames.Process));
        super.startTask(newTaskID);
    }

    function finishProcessing(uint taskID) public {
        super.finishTask(taskID);
    }

    function saveReadingMPO(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }
}