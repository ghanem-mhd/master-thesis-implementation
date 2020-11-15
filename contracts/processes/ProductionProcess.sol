// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "../../contracts/machines/Machine.sol";

contract ProductionProcess is Process {

    uint public constant Machine1 = 1;
    uint public constant Machine2 = 2;
    uint public constant Machine3 = 3;
    uint public constant Machine4 = 4;

    constructor(address _processOwner, address _productContractAddress) Process(_processOwner, _productContractAddress) public {}

    function step1(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine1, processID);
        super.assignTask(Machine1, processID, 4);
        super.markStepAsStarted(processID, 1);
    }

    function step2(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine2, processID);
        super.assignTask(Machine2, processID, 4);
        super.markStepAsStarted(processID, 2);
    }

    function step3(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine3, processID);
        super.assignTask(Machine1, processID, 2);
        super.assignTask(Machine3, processID, 1);
        super.markStepAsStarted(processID, 3);
    }

    function step4(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine4, processID);
        super.assignTask(Machine4, processID, 1);
        super.markStepAsStarted(processID, 4);
    }

    function step5(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine2, processID);
        super.assignTask(Machine2, processID, 3);
        super.markStepAsStarted(processID, 5);
    }

    function getNumberOfMachines() public override pure returns(uint) {
        return 4;
    }

    function getNumberOfSteps() public override  pure returns(uint) {
        return 5;
    }
}