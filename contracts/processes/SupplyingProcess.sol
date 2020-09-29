// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyingProcess is Process {

    enum Machines { VGR, HBW }

    constructor(address _productContractAddress) Process(_productContractAddress) public {}

    function setVGRContractAddress(address VGRContractAddress) public {
        super.setMachineContractAddress(uint(Machines.VGR), VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public {
        super.setMachineContractAddress(uint(Machines.HBW), HBWContractAddress);
    }

    function startSupplyingProcess(address productDID) public {
        uint processID = super.startProcess(productDID);
        step1(processID);
    }

    function step1(uint processID) public {
        address VGRAddress = getAddress(Machines.VGR);
        address VGRDID     = VGR(VGRAddress).getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGR(VGRAddress).assignGetInfoTask(processID, productDID);
    }

    function step2(uint processID) public {
        address HBWAddress = getAddress(Machines.HBW);
        address productDID = super.getProductDID(processID);
        super.unauthorizeCurrentMachine(productDID);
        HBW(HBWAddress).assignFetchContainerTask(processID);
    }

    function step3(uint processID) public {
        address VGRAddress = getAddress(Machines.VGR);
        address VGRDID     = VGR(VGRAddress).getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGR(VGRAddress).assignDropToHBWTask(processID, productDID);
    }

    function step4(uint processID) public {
        address HBWAddress  = getAddress(Machines.HBW);
        address HBWDID      = HBW(HBWAddress).getMachineID();
        address productDID  = super.getProductDID(processID);
        string memory NFCID = super.getProductOperationResult(productDID, "NFCTagReading");
        string memory color = super.getProductOperationResult(productDID, "ColorDetection");
        super.authorizeMachine(HBWDID, productDID);
        HBW(HBWAddress).assignStoreProductTask(processID, productDID, NFCID, color);
    }

    function getAddress(Machines machine) private view returns (address) {
        return super.getMachineContractAddress(uint(machine));
    }
}