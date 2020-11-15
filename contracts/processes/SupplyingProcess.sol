// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "../../contracts/machines/Machine.sol";

contract SupplyingProcess is Process {

    uint public constant Machine1 = 1;
    uint public constant Machine2 = 2;

    constructor(address _processOwner, address _productContractAddress) Process(_processOwner, _productContractAddress) public {}

    function step1(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine1, processID);
        super.assignTask(Machine1, processID, 1);
        super.markStepAsStarted(processID, 1);
    }

    function step2(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine2, processID);
        super.assignTask(Machine2, processID, 1);
        super.markStepAsStarted(processID, 2);
    }

    function step3(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine1, processID);
        super.assignTask(Machine1, processID, 2);
        super.markStepAsStarted(processID, 3);
    }

    function step4(uint processID) public onlyProcessOwner {
        super.authorizeMachine(Machine2, processID);
        super.assignTask(Machine2, processID, 3);
        super.markStepAsStarted(processID, 4);
    }

    function getNumberOfMachines() public override pure returns(uint) {
        return 2;
    }

    function getNumberOfSteps() public override pure returns(uint) {
        return 4;
    }
}