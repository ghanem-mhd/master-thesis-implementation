// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../ProductionLine.sol";

contract MockProductionLine is ProductionLine{

    address public DUMMY_TASK_TYPE = 0xd31A3A8A690F2bA0ef54b92c900D21169B832C2d;

    event exeDummyTask(address indexed task, address indexed device, string paramter);

    constructor() public {
        super.addTaskType(DUMMY_TASK_TYPE, "Dummy Task");
    }

    function assignDummyTask(address device) public {
        super.assignTaskType(DUMMY_TASK_TYPE, device);
    }

    function startDummyTask(address product) public{
        uint newTaskId = super.startTask(product, DUMMY_TASK_TYPE);
        super.addParam(newTaskId, "color", "Red");
        super.addParam(newTaskId, "size", "Big");
    }

    function finishDummyTask(address product, uint taskId) public {
        super.finishTask(product, taskId);
    }

    function createDummyProduct(address product) public {
        super.createProduct(product);
        startDummyTask(product);
    }
}