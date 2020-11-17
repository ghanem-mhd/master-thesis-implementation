// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract MockMachine is Machine {

    constructor(address _machineOwner, address _machineID, address _productContractAddress, address _regsitryContractAddress) Machine(_machineOwner, _machineID, _productContractAddress, _regsitryContractAddress) public {}

    function assignTask(uint processID, address productDID, uint taskType) public override returns (uint){
        if (taskType == 1) {
            return super.assignTask(processID, address(0), taskType);
        }

        if (taskType == 2) {
            uint newTaskID = super.assignTask(processID, productDID, taskType);
            super.saveTaskParam(newTaskID, "taskInput", "1");
            return newTaskID;
        }
    }

    function saveMockReading(uint taskID, ReadingType readingType, int readingValue) public {
        uint readingID = super.saveReading(taskID, readingType, readingValue);

        if (readingType == ReadingType.Temperature && readingValue > 40) {
            super.saveAlert(readingID, "critical temperature threshold exceeded", AlertType.Critical);
        }
    }

    function getTasksTypesCount() public override pure returns(uint) {
        return 2;
    }

    function getTaskTypeName(uint taskType) public override pure returns (string memory) {
        require(1 <= taskType &&  taskType <= getTasksTypesCount(), "Unkown Task Type.");
        if (taskType == 1) return "TaskWithoutProduct";
        if (taskType == 2) return "TaskWithProduct";
    }

    function getSymbol() public override pure returns (string memory) {
        return "MMM";
    }

    function getName() public override pure returns (string memory) {
        return "MockMachine (MMM)";
    }
}