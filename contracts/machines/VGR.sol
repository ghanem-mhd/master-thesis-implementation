// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract VGR is Machine {

    enum TasksNames { GetInfo, HBWDrop, PickFromHBW, Order, PickSorted }

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 5);
        if (TasksNames.GetInfo == taskName) return "GetInfo";
        if (TasksNames.HBWDrop == taskName) return "HBWDrop";
        if (TasksNames.PickFromHBW == taskName) return "PickFromHBW";
        if (TasksNames.Order == taskName) return "Order";
        if (TasksNames.PickSorted == taskName) return "PickSorted";
    }

    function getInfo(address productID) public {
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.GetInfo));
        super.saveInput(newTaskID, "code", "1");
        super.startTask(newTaskID);
    }

    function finishGetInfo(uint taskID, string memory id, string memory color) public {
        super.saveOutput(taskID, "id", id);
        super.saveOutput(taskID, "color", color);
        super.finishTask(taskID);
    }

    function dropToHBW(address productID) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.HBWDrop));
        super.saveInput(newTaskID, "code", "2");
        super.startTask(newTaskID);
    }

    function pickFromHBW(address productID) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.PickFromHBW));
        super.saveInput(newTaskID, "code", "2");
        super.startTask(newTaskID);
    }

    function order(address productID, string memory color) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.Order));
        super.saveInput(newTaskID, "color", color);
        super.saveInput(newTaskID, "code", "5");
        super.startTask(newTaskID);
    }

    function pickSorted(address productID, string memory color) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.PickSorted));
        super.saveInput(newTaskID, "color", color);
        super.saveInput(newTaskID, "code", "4");
        super.startTask(newTaskID);
    }
}