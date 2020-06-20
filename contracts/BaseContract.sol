// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

abstract contract BaseContract is Ownable, AccessControl {

    bytes32 public constant SUPPLIER_ROLE       = keccak256("SUPPLIER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE   = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant CUSTOMER_ROLE       = keccak256("CUSTOMER_ROLE");

    constructor() public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}