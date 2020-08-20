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

    function fetchContainer(string memory id, string memory color) public {
        string memory taskName = getTaskName(TasksNames.FetchContainer);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "id", id);
        super.addParam(newTaskID, "code", "1");
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID, taskName);
    }

    function storeContainer() public {
        string memory taskName = getTaskName(TasksNames.StoreContainer);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "code", "4");
        super.startTask(newTaskID, taskName);
    }

    function fetchWB(string memory color) public {
        string memory taskName = getTaskName(TasksNames.FetchWB);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "code", "3");
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID, taskName);
    }

    function storeWB(string memory id, string memory color) public {
        string memory taskName = getTaskName(TasksNames.StoreWB);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "id", id);
        super.addParam(newTaskID, "code", "2");
        super.addParam(newTaskID, "color", color);
        super.startTask(newTaskID, taskName);
    }
}