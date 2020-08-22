// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract SLD is Machine {

    enum TasksNames { StartSorting }

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 1);
        if (TasksNames.StartSorting == taskName) return "StartSorting";
    }

    function startSorting() public {
        uint newTaskID = super.createTask(address(0), getTaskName(TasksNames.StartSorting));
        super.addParam(newTaskID, "code", "8");
        super.startTask(newTaskID);
    }

    function finishSorting(uint taskID, string memory color) public {
        super.addParam(taskID, "color", color);
        super.finishTask(taskID);
    }
}