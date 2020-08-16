// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/ProductionLine.sol";

contract DemoProductionLine is ProductionLine{

    address public WAREHOUSE_TASK   = 0xc990B94f0Aaf1d70FBb9b20845AeF92Ad478b722;
    address public TRANSFER_TASK    = 0xB7D7638bEa2d28D56C5237211b0678993a5CDE5d;
    address public MAIN_TASK        = 0x1B29eBE3c20eEf4212a1991EF22EDc5945e203F3;
    address public SORTING_TASK     = 0x885Cc8847c4adb8ba40151c751DABcF7A4BE78d7;

    constructor() public {
        super.addTaskType(WAREHOUSE_TASK, "Warehouse Task");
        super.addTaskType(TRANSFER_TASK, "Transfer Task");
        super.addTaskType(MAIN_TASK, "Main Task");
        super.addTaskType(SORTING_TASK, "Sorting Task");
    }

    function createDemoProduct(address product, string memory productColor) public{
        super.createProduct(product);
        startWarehouseTask(product, productColor);
    }

    function startWarehouseTask(address product, string memory productColor) private {
         uint newTaskId = super.startTask(product, WAREHOUSE_TASK);
        super.addParam(newTaskId, "color", productColor);
    }

    function startTransferTask(address product, string memory direction) private {
        uint newTaskId = super.startTask(product, TRANSFER_TASK);
        super.addParam(newTaskId, "direction", direction);
    }

    function startMainTask(address product) private {
        super.startTask(product, MAIN_TASK);
    }

    function startSortingTask(address product) private {
        super.startTask(product, SORTING_TASK);
    }

    function finishWarehouseTask(address product, uint taskId) public {
        super.finishTask(product, taskId);
        startTransferTask(product, "d1");
    }

    function finishTransferTask(address product, uint taskId) public {
        super.finishTask(product, taskId);
        string memory direction = super.getTaskParameter(taskId, "direction");
        if (keccak256(bytes(direction)) == keccak256(bytes("d1"))){
            startMainTask(product);
        }else{
           startSortingTask(product);
        }
    }

    function finishMainTask(address product, uint taskId) public {
        super.finishTask(product, taskId);
        startTransferTask(product, "d2");
    }

    function finishSortingTask(address product, uint taskId, string memory param) public {
        super.finishTask(product, taskId);
        super.addParam(taskId, "sorting param", param);
    }

    function assignWarehouseTask(address machine) public{
        super.assignTaskType(WAREHOUSE_TASK, machine);
    }

    function assignTransferTask(address machine) public{
        super.assignTaskType(TRANSFER_TASK, machine);
    }

    function assignMainTask(address machine) public{
        super.assignTaskType(MAIN_TASK, machine);
    }

    function assignSortingTask(address machine) public{
        super.assignTaskType(SORTING_TASK, machine);
    }
}