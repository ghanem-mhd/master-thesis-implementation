// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../ProductionLine.sol";

contract MockProductionLine is ProductionLine{

    constructor() public {
        super.addTask(1, "Dummy Task");
    }

    function assignDummyTask(uint taskIndex, address deviceId) public {
        super.assignTask(taskIndex, deviceId);
    }

    function executeDummyTask(address product, uint taskIndex) public {
        super.executeTask(product, taskIndex);
    }

    function confirmDummyTask(address product, uint taskIndex) public {
        super.confirmTask(product, taskIndex);
    }

    function createDummyProduct(address product) public {
        super.createProduct(product);
    }
}