// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";

contract MockProcess is Process {

    enum Machines {Machine1, Machine2 }

    constructor(address _productContractAddress) Process(_productContractAddress) public {}

    function startMockProcess(address productDID) public {
        super.startProcess(productDID);
    }
}