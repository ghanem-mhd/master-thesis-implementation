// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/ProductionLine.sol";

contract DemoProductionLine is ProductionLine{

    address public WAREHOUSE_TASK    = 0xc990B94f0Aaf1d70FBb9b20845AeF92Ad478b722;
    address public TRANSFTER_TASK    = 0xB7D7638bEa2d28D56C5237211b0678993a5CDE5d;
    address public SORTING_TASK      = 0x885Cc8847c4adb8ba40151c751DABcF7A4BE78d7;

    event exeWarehouseTask  (address indexed task, address indexed device, address indexed product, string productColor);
    event exeTransferTask   (address indexed task, address indexed device, address indexed product,string mode);
    event exeSortingTask    (address indexed task, address indexed device, address indexed product,string paramter);


    constructor() public {
        super.addTask(WAREHOUSE_TASK, "Warehouse Task");
        super.addTask(TRANSFTER_TASK, "Transfer Task");
        super.addTask(SORTING_TASK, "Sorting Task");
    }

    function assignWarehouseTask(address device) public{
        super.assignTask(WAREHOUSE_TASK, device);
    }

    function executeWarehouseTask(address product, string memory productColor) public {
        super.executeTask(product, WAREHOUSE_TASK);
        emit exeWarehouseTask(WAREHOUSE_TASK, super.getDeviceAssigned(WAREHOUSE_TASK), product, productColor);
    }

    function confirmWarehouseTask(address product) public {
        super.confirmTask(product, WAREHOUSE_TASK);
    }

    function createDemoProduct(address product, string memory productColor) public{
        super.createProduct(product);
        executeWarehouseTask(product, productColor);
    }
}