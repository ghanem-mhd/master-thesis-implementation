// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract VGR is Machine {

    enum TasksNames { GetInfo }

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 1);
        if (TasksNames.GetInfo == taskName) return "GetInfo";
    }

    function getInfo() public{
        uint newTaskId = super.createTask(address(0), getTaskName(TasksNames.GetInfo));
        super.startTask(newTaskId);
    }

    function storeVGRReading(Machine.ReadingType readingType, int readingValue) public {
        uint newReadingID = super.newReading(readingType, readingValue);


        if (readingType == Machine.ReadingType.Temperature){
            if (readingValue >= 25){
                super.newIssue(newReadingID, "Temperature threshold exceeded");
            }
        }
    }
}