// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Pipeline.sol";
import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/machines/SLD.sol";
import "../../contracts/machines/MPO.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductionLine is Pipeline {

    enum Machines { VGR, HBW, SLD, MPO }

    function setVGRContractAddress(address VGRContractAddress) public {
       super.setMachineContractAddress(uint(Machines.VGR), VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public {
       super.setMachineContractAddress(uint(Machines.HBW), HBWContractAddress);
    }

    function setSLDContractAddress(address SLDContractAddress) public {
       super.setMachineContractAddress(uint(Machines.SLD), SLDContractAddress);
    }

    function setMPOContractAddress(address MPOContractAddress) public {
        super.setMachineContractAddress(uint(Machines.MPO), MPOContractAddress);
    }

    function order(address productID, string memory color) public {
        HBW(getAddress(Machines.HBW)).fetchWB(productID, color);
    }

    function onFetchWBFinished(address productID) public {
        VGR(getAddress(Machines.VGR)).moveHBW2MPO(productID);
    }

    function onMoveHBW2MPOFinished(address productID) public {
        HBW(getAddress(Machines.HBW)).storeContainer(productID);
        MPO(getAddress(Machines.MPO)).startProcessing(productID);
    }

    function onProcessingFinished(address productID) public {
        SLD(getAddress(Machines.SLD)).startSorting(productID);
    }

    function onSortingFinished(address productID) public {
        string memory color = SLD(getAddress(Machines.SLD)).getProductInfo(productID, "color");
        VGR(getAddress(Machines.VGR)).pickSorted(productID, color);
    }

    function getAddress(Machines machine) private view returns (address) {
        return super.getMachineContractAddress(uint(machine));
    }
}