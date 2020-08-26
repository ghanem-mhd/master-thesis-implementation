// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract MockMachine is Machine {

    constructor(address _machineOwner, address _machineID) Machine(_machineOwner, _machineID) public {}

    function createTaskWithProduct(address productID, string memory taskName) public {
        super.createTask(productID, taskName);
    }

    function createTaskWithoutProduct(string memory taskName) public {
        uint newTaskID = super.createTask(address(0), taskName);
        super.saveInput(newTaskID, "taskInput", "1");
        super.startTask(newTaskID);
    }

    function finishTheTask(uint taskID, string memory outputValue) public {
        super.saveOutput(taskID, "taskOutput", outputValue);
        super.finishTask(taskID);
    }

    function saveMockProduct(address productID) public {
        super.saveProduct(productID);
    }
}