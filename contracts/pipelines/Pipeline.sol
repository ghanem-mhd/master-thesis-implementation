// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;


import "../../contracts/setTypes/UintSet.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Pipeline is Ownable {

    mapping (uint => address) machinesContracts;

    function setMachineContractAddress(uint machineID, address machineContractAddress) internal onlyOwner {
        machinesContracts[machineID] = machineContractAddress;
    }

    function getMachineContractAddress(uint machineID) public view returns (address) {
       return machinesContracts[machineID];
    }
}