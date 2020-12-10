// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Machine.sol";

contract MPO is Machine {

    constructor(address _machineOwner, address _machineID, address _productContractAddress, address _regsitryContractAddress) Machine(_machineOwner, _machineID, _productContractAddress, _regsitryContractAddress) public {}

    function getTaskTypeName(uint taskType) public override pure returns (string memory) {
        require(1 <= taskType &&  taskType <= getTasksTypesCount(), "Unknown Task Type.");
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

    function getSymbol() public override pure returns (string memory) {
        return "MPO";
    }

    function getName() public override pure returns (string memory) {
        return "Multi-Processing Station (MPO) - FIT";
    }
}