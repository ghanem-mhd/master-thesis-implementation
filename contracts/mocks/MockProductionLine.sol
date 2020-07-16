// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../ProductionLine.sol";

contract MockProductionLine is ProductionLine{

    address public DUMMY_TASK_ID = 0xd31A3A8A690F2bA0ef54b92c900D21169B832C2d;

    event exeDummyTask(address indexed task, address indexed device, string paramter);

    constructor() public {
        super.addTask(DUMMY_TASK_ID, "Dummy Task");
    }

    function assignDummyTask(address deviceId) public {
        super.assignTask(DUMMY_TASK_ID, deviceId);
    }

    function executeDummyTask(address product) public {
        super.executeTask(product, DUMMY_TASK_ID);
        emit exeDummyTask(DUMMY_TASK_ID, super.getDeviceAssigned(DUMMY_TASK_ID), "parameter");
    }

    function confirmDummyTask(address product) public {
        super.confirmTask(product, DUMMY_TASK_ID);
    }

    function createDummyProduct(address product) public {
        super.createProduct(product);
    }
}