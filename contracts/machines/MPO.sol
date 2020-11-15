// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract MPO is Machine {

    enum TasksNames { Processing }

    constructor(address _machineOwner, address _machineID, address _productContractAddress) Machine(_machineOwner, _machineID, _productContractAddress) public {}

    function getTaskTypeName(uint taskType) public override pure returns (string memory) {
        require(1 <= taskType &&  taskType <= getTasksTypesCount(), "Unkown Task Type.");
        return "Processing";
    }

    function assignTask(uint processID, address productDID, uint taskType) public override returns (uint){
        if (taskType == 1) {
            return super.assignTask(processID, productDID, taskType);
        }
    }

    function saveReadingMPO(uint taskID, ReadingType readingType, int readingValue) public {
        super.saveReading(taskID, readingType, readingValue);
    }

    function getTasksTypesCount() public override pure returns(uint) {
        return 1;
    }
}