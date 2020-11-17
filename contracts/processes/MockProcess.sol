// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";

contract MockProcess is Process {

    enum Machines {Machine1, Machine2 }

    constructor(address _processOwner, address _productContractAddress, address _regsitryContractAddress) Process(_processOwner, _productContractAddress, _regsitryContractAddress) public {}

    function getStepTaskType(uint stepNumber) public override pure returns (uint) {
        require(1 <= stepNumber &&  stepNumber <= getNumberOfSteps(), "Wrong step number.");
        return 1;
    }

    function getMachineNumber(uint stepNumber) public override pure returns (uint) {
        require(1 <= stepNumber &&  stepNumber <= getNumberOfSteps(), "Wrong step number.");
        if (stepNumber == 1) return 1;
    }

    function startMockProcess(address productDID) public {
        super.startProcess(productDID);
    }

    function getNumberOfMachines() public override pure returns(uint) {
        return 1;
    }

    function getNumberOfSteps() public override pure returns(uint) {
        return 2;
    }

    function getSymbol() public override pure returns (string memory) {
        return "MP";
    }

    function getName() public override pure returns (string memory) {
        return "Mock Process";
    }
}