// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract VGR is Machine {

    constructor(address _machineOwner, address _machineID, address _productContractAddress, address _regsitryContractAddress) Machine(_machineOwner, _machineID, _productContractAddress, _regsitryContractAddress) public {}

    function getTaskTypeName(uint taskType) public override pure returns (string memory) {
        require(1 <= taskType &&  taskType <= getTasksTypesCount(), "Unkown Task Type.");
        if (taskType == 1) return "GetInfo";
        if (taskType == 2) return "DropToHBW";
        if (taskType == 3) return "PickSorted";
        if (taskType == 4) return "MoveHBW2MPO";
    }

    function finishGetInfoTask(uint taskID, string memory nfcTag, string memory color) public {
        super.saveProductOperation(taskID, "NFCTagReading", nfcTag);
        super.saveProductOperation(taskID, "ColorDetection", color);
        super.finishTask(taskID, TaskStatus.FinishedSuccessfully, "");
    }

    function assignTask(uint processID, address productDID, uint taskType) public override returns (uint) {
        if (taskType == 1) {
            return super.assignTask(processID, productDID, taskType);
        }

        if (taskType == 2) {
            return super.assignTask(processID, productDID, taskType);
        }

        if (taskType == 3) {
            string memory color = super.getProductOperationResult(productDID, "Sorting");
            uint taskID = super.assignTask(processID, productDID, taskType);
            super.saveTaskParam(taskID, "color", color);
            return taskID;
        }

        if (taskType == 4) {
            return super.assignTask(processID, productDID, taskType);
        }
    }

    function saveReadingVGR(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }

    function getTasksTypesCount() public override pure returns(uint) {
        return 4;
    }

    function getSymbol() public override pure returns (string memory) {
        return "VGR";
    }

    function getName() public override pure returns (string memory) {
        return "Vacuum Gripper Robot (VGR)";
    }
}