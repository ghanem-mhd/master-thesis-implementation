// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyingProcess is Process {

    constructor(address _productContractAddress) Process(_productContractAddress) public {}

    VGR private VGRContract;
    HBW private HBWContract;

    function setVGRContractAddress(address VGRContractAddress) public {
        VGRContract = VGR(VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public {
        HBWContract = HBW(HBWContractAddress);
    }

    function startSupplyingProcess(address productDID) public {
        uint processID = super.startProcess(productDID);
        step1(processID);
    }

    function step1(uint processID) public {
        address VGRDID     = VGRContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignGetInfoTask(processID, productDID);
    }

    function step2(uint processID) public {
        address productDID = super.getProductDID(processID);
        super.unauthorizeCurrentMachine(productDID);
        HBWContract.assignFetchContainerTask(processID);
    }

    function step3(uint processID) public {
        address VGRDID     = VGRContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignDropToHBWTask(processID, productDID);
    }

    function step4(uint processID) public {
        address HBWDID      = HBWContract.getMachineID();
        address productDID  = super.getProductDID(processID);
        string memory NFCID = super.getProductOperationResult(productDID, "NFCTagReading");
        string memory color = super.getProductOperationResult(productDID, "ColorDetection");
        super.authorizeMachine(HBWDID, productDID);
        HBWContract.assignStoreProductTask(processID, productDID, NFCID, color);
    }
}