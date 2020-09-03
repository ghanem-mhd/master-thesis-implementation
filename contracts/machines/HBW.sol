// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract HBW is Machine {

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    enum TasksNames { FetchContainer, StoreContainer, FetchWB, StoreWB }

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 4);
        if (TasksNames.FetchContainer == taskName) return "FetchContainer";
        if (TasksNames.StoreContainer == taskName) return "StoreContainer";
        if (TasksNames.StoreWB == taskName) return "StoreWB";
        if (TasksNames.FetchWB == taskName) return "FetchWB";
    }

    function fetchContainer(address productID) public {
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.FetchContainer));
        super.startTask(newTaskID);
    }

    function storeWB(address productID, string memory id, string memory color) public {
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.StoreWB));
        super.saveInput(newTaskID, "id", id);
        super.saveInput(newTaskID, "color", color);
        super.startTask(newTaskID);
    }

    function fetchWB(address productID, string memory color) public {
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.FetchWB));
        super.saveInput(newTaskID, "color", color);
        super.startTask(newTaskID);
    }

    function storeContainer(address productID) public {
        uint newTaskID = super.createTask(productID, getTaskName(TasksNames.StoreContainer));
        super.startTask(newTaskID);
    }

    function saveReadingHBW(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }
}