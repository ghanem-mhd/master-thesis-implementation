// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleManager is Ownable, AccessControl {

    bytes32 public constant SUPPLIER_ROLE       = keccak256("SUPPLIER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE   = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant CUSTOMER_ROLE       = keccak256("CUSTOMER_ROLE");
    bytes32 public constant ADMIN_ROLE          = keccak256("ADMIN_ROLE");

    constructor() public {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(MANUFACTURER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(SUPPLIER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CUSTOMER_ROLE, ADMIN_ROLE);
    }
}