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
        uint newTaskID = super.createTask(address(0), getTaskName(TasksNames.GetInfo));
        super.addParam(newTaskID, "code", "1");
        super.startTask(newTaskID);
    }

    function finishGetInfo(string memory id, string memory color) public{
        uint newTaskID = super.createTask(address(0), getTaskName(TasksNames.GetInfo));
        super.addParam(newTaskID, "id", id);
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID);
    }

    function hbwDrop(string memory id, string memory color) public{
        uint newTaskID = super.createTask(address(0), getTaskName(TasksNames.HBWDrop));
        super.addParam(newTaskID, "code", "2");
        super.addParam(newTaskID, "id", id);
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID);
    }

    function order(string memory color) public{
        uint newTaskID = super.createTask(address(0), getTaskName(TasksNames.Order));
        super.addParam(newTaskID, "color", color);
        super.addParam(newTaskID, "code", "5");
        super.startTask(newTaskID);
    }

    function pickSorted(string memory color) public{
        uint newTaskID = super.createTask(address(0), getTaskName(TasksNames.PickSorted));
        super.addParam(newTaskID, "color", color);
        super.addParam(newTaskID, "code", "4");
        super.startTask(newTaskID);
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