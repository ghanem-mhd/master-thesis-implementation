// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract VGR is Machine {

    enum TasksNames { GetInfo, HBWDrop, Order, PickSorted }

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 4);
        if (TasksNames.GetInfo == taskName) return "GetInfo";
        if (TasksNames.HBWDrop == taskName) return "HBWDrop";
        if (TasksNames.Order == taskName) return "Order";
        if (TasksNames.PickSorted == taskName) return "PickSorted";
    }

    function getInfo() public{
        string memory taskName = getTaskName(TasksNames.GetInfo);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "code", "1");
        super.startTask(newTaskID, taskName);
    }

    function finishGetInfo(string memory id, string memory color) public{
        string memory taskName = getTaskName(TasksNames.GetInfo);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "id", id);
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID, taskName);
    }

    function hbwDrop(string memory id, string memory color) public{
        string memory taskName = getTaskName(TasksNames.HBWDrop);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "code", "2");
        super.addParam(newTaskID, "id", id);
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID, taskName);
    }

    function order(string memory color) public{
        string memory taskName = getTaskName(TasksNames.Order);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "color", color);
        super.addParam(newTaskID, "code", "5");
        super.startTask(newTaskID, taskName);
    }

    function pickSorted(string memory color) public{
        string memory taskName = getTaskName(TasksNames.PickSorted);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "color", color);
        super.addParam(newTaskID, "code", "4");
        super.startTask(newTaskID, taskName);
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