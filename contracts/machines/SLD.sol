// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract SLD is Machine {

    enum TasksNames { Sorting }

    constructor(address _machineOwner, address _machineID, address _productContractAddress) Machine(_machineOwner, _machineID, _productContractAddress) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 1);
        if (TasksNames.Sorting == taskName) return "Sorting";
    }

    function assignSortingTask(uint processID, address productDID) public {
        super.assignTask(processID, productDID, getTaskName(TasksNames.Sorting));
    }

    function finishSorting(uint taskID, string memory color) public {
        super.saveProductOperation(taskID, "Sorting", color);
        super.finishTask(taskID);
    }

    function saveReadingSLD(uint taskID, ReadingType readingType, int readingValue) public {
        uint readingID = super.saveReading(taskID, readingType, readingValue);

        if (readingType == ReadingType.Brightness && readingValue < 70) {
            super.saveAlert(readingID, "Brightness is too low", AlertType.Major);
        }
    }
}