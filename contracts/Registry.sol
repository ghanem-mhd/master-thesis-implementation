// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../contracts/setTypes/AddressSet.sol";

contract Registry is Ownable {

    using Counters for Counters.Counter;
    using AddressSet for AddressSet.Set;

    mapping (string => address) nameAddressMapping;
    mapping (address => string) addressNameMapping;

    AddressSet.Set private machinesContracts;
    AddressSet.Set private processesContracts;

    modifier nameAvaliable(string memory name) {
        require(nameAddressMapping[name] == address(0x0), "Name already registered for another address.");
        _;
    }

    function registerName(string memory name, address addr) public nameAvaliable(name) {
        nameAddressMapping[name] = addr;
        addressNameMapping[addr] = name;
    }

    function resolveAddress(address add) public view returns(string memory) {
        return addressNameMapping[add];
    }

    function resolveName(string memory name) public view returns(address) {
        return nameAddressMapping[name];
    }

    function registerMachine(string memory machineName, address machineContractAddress) public {
        require(!machinesContracts.exists(machineContractAddress), "Machine contract address already exists.");
        machinesContracts.insert(machineContractAddress);
        registerName(machineName, machineContractAddress);
    }

    function getMachineContract(uint machineContractID) public view returns (string memory, address) {
        return (resolveAddress(machinesContracts.keyAtIndex(machineContractID)),
            machinesContracts.keyAtIndex(machineContractID)
        );
    }

    function registerProcess(string memory processName, address processContractAddress) public {
        require(!processesContracts.exists(processContractAddress), "Process contract address already exists.");
        processesContracts.insert(processContractAddress);
        registerName(processName, processContractAddress);
    }

    function getProcessContract(uint processContractID) public view returns (string memory, address) {
        return (resolveAddress(processesContracts.keyAtIndex(processContractID)),
            processesContracts.keyAtIndex(processContractID)
        );
    }

    function getMachineContractsCount() public view returns (uint) {
        return machinesContracts.count();
    }

    function getProcessesContractsCount() public view returns (uint) {
        return processesContracts.count();
    }
}