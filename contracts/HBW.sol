// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract HBW is Machine {

    constructor(address _machineOwner, address _machineID, address _productContractAddress, address _regsitryContractAddress) Machine(_machineOwner, _machineID, _productContractAddress, _regsitryContractAddress) public {}

    function getTaskTypeName(uint taskType) public override pure returns (string memory) {
        require(1 <= taskType &&  taskType <= getTasksTypesCount(), "Unknown Task Type.");
        if (taskType == 1) return "FetchContainer";
        if (taskType == 2) return "StoreContainer";
        if (taskType == 3) return "StoreProduct";
        if (taskType == 4) return "FetchProduct";
    }

    function assignTask(uint processID, address productDID, uint taskType) public override returns (uint){
        if (taskType == 1) {
            return super.assignTask(processID, productDID, taskType);
        }

        if (taskType == 2) {
            return super.assignTask(processID, productDID, taskType);
        }

        if (taskType == 3) {
            string memory color = super.getProductOperationResult(productDID, "ColorDetection");
            string memory id = super.getProductOperationResult(productDID, "NFCTagReading");
            uint taskID = super.assignTask(processID, productDID, taskType);
            super.saveTaskParam(taskID, "id", id);
            super.saveTaskParam(taskID, "color", color);
            return taskID;
        }

        if (taskType == 4) {
            return super.assignTask(processID, productDID, taskType);
        }
    }

    function saveReadingHBW(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }

    function getTasksTypesCount() public override pure returns(uint) {
        return 4;
    }

    function getSymbol() public override pure returns (string memory) {
        return "HBW";
    }

    function getName() public override pure returns (string memory) {
        return "High-Bay Warehouse (HBW) - FIT";
    }
}