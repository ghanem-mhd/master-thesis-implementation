// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract MPO is Machine {

    enum TasksNames { StartProcessing }

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 1);
        if (TasksNames.StartProcessing == taskName) return "StartProcessing";
    }

    function startProcessing() public {
        string memory taskName = getTaskName(TasksNames.StartProcessing);
        uint newTaskID = super.createTask(address(0), taskName);
        super.addParam(newTaskID, "code", "7");
        super.startTask(newTaskID, taskName);
    }

    function finishProcessing(uint taskID) public {
        super.finishTask(taskID);
    }
}