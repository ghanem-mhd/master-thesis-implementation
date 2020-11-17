// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract SLD is Machine {

    constructor(address _machineOwner, address _machineID, address _productContractAddress, address _regsitryContractAddress) Machine(_machineOwner, _machineID, _productContractAddress, _regsitryContractAddress) public {}

    function getTaskTypeName(uint taskType) public override pure returns (string memory) {
        require(1 <= taskType &&  taskType <= getTasksTypesCount(), "Unkown Task Type.");
        return "Sorting";
    }

    function assignTask(uint processID, address productDID, uint taskType) public override returns (uint){
        if (taskType == 1) {
            return super.assignTask(processID, productDID, taskType);
        }
    }

    function finishSorting(uint taskID, string memory color) public {
        super.saveProductOperation(taskID, "Sorting", color);
        super.finishTask(taskID, TaskStatus.FinishedSuccessfully);
    }

    function saveReadingSLD(uint taskID, ReadingType readingType, int readingValue) public {
        uint readingID = super.saveReading(taskID, readingType, readingValue);

        if (readingType == ReadingType.Brightness && readingValue < 70) {
            super.saveAlert(readingID, "Brightness is too low", AlertType.Major);
        }
    }

    function getTasksTypesCount() public override pure returns(uint) {
        return 1;
    }

    function getSymbol() public override pure returns (string memory) {
        return "SLD";
    }

    function getName() public override pure returns (string memory) {
        return "Sorting Line with Color Detection (SLD)";
    }
}