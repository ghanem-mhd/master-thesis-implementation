// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract VGR is Machine {

    enum TasksNames { GetInfo, DropToHBW, MoveHBW2MPO, PickSorted }

    constructor(address _machineOwner, address _machineID, address _productContractAddress) Machine(_machineOwner, _machineID, _productContractAddress) public {}

    function getTaskName(TasksNames taskName) internal pure returns (string memory) {
        require(uint8(taskName) <= 5);
        if (TasksNames.GetInfo == taskName) return "GetInfo";
        if (TasksNames.DropToHBW == taskName) return "DropToHBW";
        if (TasksNames.PickSorted == taskName) return "PickSorted";
        if (TasksNames.MoveHBW2MPO == taskName) return "MoveHBW2MPO";
    }

    function assignGetInfoTask(uint processID, address productDID) public {
        super.assignTask(processID, productDID, getTaskName(TasksNames.GetInfo));
    }

    function finishGetInfoTask(uint taskID, string memory nfcTag, string memory color) public {
        super.saveProductOperation(taskID, "NFCTagReading", nfcTag);
        super.saveProductOperation(taskID, "ColorDetection", color);
        super.finishTask(taskID, TaskStatus.FinishedSuccessfully);
    }

    function assignDropToHBWTask(uint processID, address productDID) public{
        super.assignTask(processID, productDID, getTaskName(TasksNames.DropToHBW));
    }

    function assignMoveHBW2MPOTask(uint processID, address productDID) public{
        super.assignTask(processID, productDID, getTaskName(TasksNames.MoveHBW2MPO));
    }

    function assignPickSortedTask(uint processID, address productDID, string memory color) public{
       uint taskID = super.assignTask(processID, productDID, getTaskName(TasksNames.PickSorted));
       super.saveTaskParam(taskID, "color", color);
    }

    function saveReadingVGR(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }
}