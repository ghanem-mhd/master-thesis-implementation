// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;


import "../../contracts/setTypes/UintSet.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Pipeline is Ownable {

    using Counters for Counters.Counter;
    using AddressSet for AddressSet.Set;
    using UintSet for UintSet.Set;

    Counters.Counter private instanceCounter;
    UintSet.Set private instanceIDs;

    mapping (uint => address) machinesContracts;

    function setMachineContractAddress(uint machineID, address machineContractAddress) internal {
        machinesContracts[machineID] = machineContractAddress;
    }

    function getMA(uint machineID) public view returns (address) {
       return machinesContracts[machineID];
    }

    function newInstance() internal {
        instanceCounter.increment();
        uint newInstanceID = instanceCounter.current();

        instanceIDs.insert(newInstanceID);
    }

    function getInstanceCount() public view returns (uint) {
        return instanceCounter.current();
    }

}