// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract HBW is Machine {

    constructor(address _machineOwner, address _machineID, address _productContractAddress) Machine(_machineOwner, _machineID, _productContractAddress) public {}

    enum TasksNames { FetchContainer, StoreContainer, StoreProduct, FetchProduct }

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 4);
        if (TasksNames.FetchContainer == taskName) return "FetchContainer";
        if (TasksNames.StoreContainer == taskName) return "StoreContainer";
        if (TasksNames.StoreProduct == taskName) return "StoreProduct";
        if (TasksNames.FetchProduct == taskName) return "FetchProduct";
    }

    function assignFetchContainerTask(uint processID) public {
        super.assignTask(processID, address(0), getTaskName(TasksNames.FetchContainer));
    }

    function assignStoreProductTask(uint processID, address productDID, string memory id, string memory color) public {
        uint taskID = super.assignTask(processID, productDID, getTaskName(TasksNames.StoreProduct));
        super.saveTaskParam(taskID, "id", id);
        super.saveTaskParam(taskID, "color", color);
    }

    function assignFetchProductTask(uint processID, address productDID) public {
        super.assignTask(processID, productDID, getTaskName(TasksNames.FetchProduct));
    }

    function assignStoreContainerTask(uint processID) public {
        super.assignTask(processID, address(0), getTaskName(TasksNames.StoreContainer));
    }

    function saveReadingHBW(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }
}