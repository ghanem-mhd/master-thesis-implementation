// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/ProductionLine.sol";

contract SupplyLine is ProductionLine {

    address public WAREHOUSE_TASK   = 0xc990B94f0Aaf1d70FBb9b20845AeF92Ad478b722;
    address public TRANSFER_TASK    = 0xB7D7638bEa2d28D56C5237211b0678993a5CDE5d;

    constructor() public {
        super.addTaskType(WAREHOUSE_TASK, "Warehouse Task");
        super.addTaskType(TRANSFER_TASK, "Transfer Task");
    }

    function newRawMaterial(address product, bytes32 productColor) public {
        super.createProduct(product);
        uint newTaskId = super.executeTask(product, TRANSFER_TASK);
        super.addParam(newTaskId, "color", productColor);
        startFetchContainer();
    }

    function startFetchContainer() private {
        uint newTaskId = super.startTask(address(0), WAREHOUSE_TASK);
        super.addParam(newTaskId, "type", "HBW_FETCHCONTAINER");
    }

    function finishFetchContainer(uint taskId) public {
        super.finishTask(address(0), taskId);
        startStoreRawMaterial();
    }

    function startStoreRawMaterial() private {
        uint newTaskId = super.startTask(address(0), WAREHOUSE_TASK);
        super.addParam(newTaskId, "type", "HBW_STORE_WP");
    }

    function finishStoreRawMaterial(uint taskId) public {
        super.finishTask(address(0), taskId);
    }

    function assignTransferTask(address device) public{
        super.assignTaskType(TRANSFER_TASK, device);
    }

    function assignWarehouseTask(address device) public{
        super.assignTaskType(WAREHOUSE_TASK, device);
    }
}