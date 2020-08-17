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
        uint newTaskId = super.createTask(address(0), getTaskName(TasksNames.StartProcessing));
        super.startTask(newTaskId);
    }

    function finishProcessing(uint taskID) public {
        super.finishTask(taskID);
    }
}