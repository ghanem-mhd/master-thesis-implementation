// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;


import "../../contracts/setTypes/UintSet.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Process is Ownable {

    using UintSet for UintSet.Set;
    using Counters for Counters.Counter;

    Counters.Counter private processesCounter;

    mapping (address => uint256) private productProcessMapping;
    mapping (uint256 => address) private processProductMapping;

    mapping (uint => address) machinesContracts;

    function setMachineContractAddress(uint machineID, address machineContractAddress) internal onlyOwner {
        machinesContracts[machineID] = machineContractAddress;
    }

    function getMachineContractAddress(uint machineID) public view returns (address) {
       return machinesContracts[machineID];
    }

    function startProcess(address productDID) public returns(uint256) internal {
        processesCounter.increment();
        uint processID = processesCounter.current();

        productProcessMapping[productDID] = processID;
        processProductMapping[processID]  = productDID;

        return processID;
    }

    function getProcessID(address productDID) public view returns (uint256) {
        require(productProcessMapping[productDID] != 0, "No process for the given product.");
        return productProcessMapping[productDID];
    }

    function getProductDID(uint256 processID) public view returns (address) {
        require(processID != 0, "Process doesn't exists.");
        require(processesCounter.current() >= processID, "Process doesn't exists.");
        return processProductMapping[processID];
    }

    function getProcessesCount() public view returns (uint256) {
        return processesCounter.current();
    }
}