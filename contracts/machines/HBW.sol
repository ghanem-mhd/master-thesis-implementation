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

    function fetchContainer() public {
        uint newTaskId = super.createTask(address(0), getTaskName(TasksNames.FetchContainer));
        // store params
        super.startTask(newTaskId);
    }

    function storeContainer() public {
        uint newTaskId = super.createTask(address(0), getTaskName(TasksNames.StoreContainer));
        // store params
        super.startTask(newTaskId);
    }

    function fetchWB() public {
        uint newTaskId = super.createTask(address(0), getTaskName(TasksNames.FetchWB));
        // store params
        super.startTask(newTaskId);
    }

    function storeWB() public {
        uint newTaskId = super.createTask(address(0), getTaskName(TasksNames.StoreWB));
        // store params
        super.startTask(newTaskId);
    }
}