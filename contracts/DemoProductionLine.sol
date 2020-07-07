// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/ProductionLine.sol";

contract DemoProductionLine is ProductionLine{

    constructor() public {
        super.addTask(1, "Get from warhouse.");
        super.addTask(2, "Tranfter from warhouse to kiln.");
        super.addTask(3, "Tranfter from kiln to sorting line.");
        super.addTask(4, "Sort product.");
    }
}