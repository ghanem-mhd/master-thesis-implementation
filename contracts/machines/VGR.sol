// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract VGR is Machine {

    enum TasksNames { GetInfo, DropToHBW, MoveHBW2MPO, PickSorted }

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 5);
        if (TasksNames.GetInfo == taskName) return "GetInfo";
        if (TasksNames.DropToHBW == taskName) return "DropToHBW";
        if (TasksNames.PickSorted == taskName) return "PickSorted";
        if (TasksNames.MoveHBW2MPO == taskName) return "MoveHBW2MPO";
    }

    function getInfo(address productID) public {
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.GetInfo));
        super.startTask(newTaskID);
    }

    function finishGetInfo(uint taskID, string memory nfcTag, string memory color) public {
        address productID = super.getProductID(taskID);
        super.saveProductOperation(productID, "NFCTagReading", nfcTag);
        super.saveProductOperation(productID, "ColorDetection", color);
        super.finishTask(taskID);
    }

    function dropToHBW(address productID) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.DropToHBW));
        super.startTask(newTaskID);
    }

    function moveHBW2MPO(address productID) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.MoveHBW2MPO));
        super.startTask(newTaskID);
    }

    function pickSorted(address productID, string memory color) public{
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.PickSorted));
        super.saveInput(newTaskID, "color", color);
        super.startTask(newTaskID);
    }
}