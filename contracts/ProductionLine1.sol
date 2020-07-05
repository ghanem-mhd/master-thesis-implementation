// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/ProductionLine.sol";

contract ProductionLine1 is ProductionLine{

    constructor() public {
        //roleManager = addr;
        super.addTask(1,"Task 1");
        super.addTask(2,"Task 2");
        super.addTask(3,"Task 3");
        super.addTask(4,"Task 4");
    }

    function assignTask1(address deviceId) public{
        super.assignTask(1, deviceId);
    }


    function requestTask1() public{

    }

    function confirmTask1() public{

    }



}