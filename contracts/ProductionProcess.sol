// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "./Machine.sol";

contract ProductionProcess is Process {

    constructor(address _processOwner, address _productContractAddress, address _regsitryContractAddress) Process(_processOwner, _productContractAddress, _regsitryContractAddress) public {}

    function getStepTaskType(uint stepNumber) public override pure returns (uint) {
        require(1 <= stepNumber &&  stepNumber <= getNumberOfSteps(), "Wrong step number.");
        if (stepNumber == 1) return 4;
        if (stepNumber == 2) return 4;
        if (stepNumber == 3) return 1;
        if (stepNumber == 4) return 1;
        if (stepNumber == 5) return 3;
    }

    function getMachineNumber(uint stepNumber) public override pure returns (uint) {
        require(1 <= stepNumber &&  stepNumber <= getNumberOfSteps(), "Wrong step number.");
        if (stepNumber == 1) return 1;
        if (stepNumber == 2) return 2;
        if (stepNumber == 3) return 3;
        if (stepNumber == 4) return 4;
        if (stepNumber == 5) return 2;
    }

    function step1(uint processID) public onlyProcessOwner {
        super.authorizeMachine(getMachineNumber(1), processID);
        super.assignTask(getMachineNumber(1), processID, getStepTaskType(1));
        super.markStepAsStarted(processID, 1);
    }

    function step2(uint processID) public onlyProcessOwner {
        super.authorizeMachine(getMachineNumber(2), processID);
        super.assignTask(getMachineNumber(2), processID, getStepTaskType(2));
        super.markStepAsStarted(processID, 2);
    }

    function step3(uint processID) public onlyProcessOwner {
        super.assignTask(1, processID, 2);
        super.authorizeMachine(getMachineNumber(3), processID);
        super.assignTask(getMachineNumber(3), processID, getStepTaskType(3));
        super.markStepAsStarted(processID, 3);
    }

    function step4(uint processID) public onlyProcessOwner {
        super.authorizeMachine(getMachineNumber(4), processID);
        super.assignTask(getMachineNumber(4), processID, getStepTaskType(4));
        super.markStepAsStarted(processID, 4);
    }

    function step5(uint processID) public onlyProcessOwner {
        super.authorizeMachine(getMachineNumber(5), processID);
        super.assignTask(getMachineNumber(5), processID, getStepTaskType(5));
        super.markStepAsStarted(processID, 5);
    }

    function getNumberOfMachines() public override pure returns(uint) {
        return 4;
    }

    function getNumberOfSteps() public override  pure returns(uint) {
        return 5;
    }

    function getSymbol() public override pure returns (string memory) {
        return "PP";
    }

    function getName() public override pure returns (string memory) {
        return "Production Process";
    }
}