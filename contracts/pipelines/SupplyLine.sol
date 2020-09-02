// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Pipeline.sol";
import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyLine is Pipeline {

    enum Machines { VGR, HBW }

    function setVGRContractAddress(address VGRContractAddress) public {
        super.setMachineContractAddress(uint(Machines.VGR), VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public {
        super.setMachineContractAddress(uint(Machines.HBW), HBWContractAddress);
    }

    function getInfo(address productID) public {
        VGR(getAddress(Machines.VGR)).getInfo(productID);
    }

    function getInfoFinished(address productID) public {
        HBW(getAddress(Machines.HBW)).fetchContainer(productID);
    }

    function fetchContainerFinished(address productID) public {
        VGR(getAddress(Machines.VGR)).dropToHBW(productID);
    }

    function dropToHBWFinished(address productID) public {
        string memory id    = VGR(getAddress(Machines.VGR)).getProductOperationValue(productID, "NFCTagReading");
        string memory color = VGR(getAddress(Machines.VGR)).getProductOperationValue(productID, "ColorDetection");
        HBW(getAddress(Machines.HBW)).storeWB(productID, id, color);
    }

    function getAddress(Machines machine) private view returns (address) {
        return super.getMachineContractAddress(uint(machine));
    }
}