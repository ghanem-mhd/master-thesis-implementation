// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyingProcess is Process {

    constructor(address _processOwner, address _productContractAddress) Process(_processOwner, _productContractAddress) public {}

    VGR public VGRContract;
    HBW public HBWContract;

    function setVGRContractAddress(address VGRContractAddress) public onlyProcessOwner {
        VGRContract = VGR(VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public onlyProcessOwner {
        HBWContract = HBW(HBWContractAddress);
    }

    function startSupplyingProcess(address productDID) public {
        super.startProcess(productDID);
    }

    function step1(uint processID) public onlyProcessOwner {
        address VGRDID     = VGRContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignGetInfoTask(processID, productDID);
        emit ProcessStepStarted(processID, productDID, 1);
    }

    function step2(uint processID) public onlyProcessOwner {
        address productDID = super.getProductDID(processID);
        super.unauthorizeCurrentMachine(productDID);
        HBWContract.assignFetchContainerTask(processID);
        emit ProcessStepStarted(processID, address(0), 2);
    }

    function step3(uint processID) public onlyProcessOwner {
        address VGRDID     = VGRContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignDropToHBWTask(processID, productDID);
        emit ProcessStepStarted(processID, productDID, 3);
    }

    function step4(uint processID) public onlyProcessOwner {
        address HBWDID      = HBWContract.getMachineID();
        address productDID  = super.getProductDID(processID);
        string memory NFCID = super.getProductOperationResult(productDID, "NFCTagReading");
        string memory color = super.getProductOperationResult(productDID, "ColorDetection");
        super.authorizeMachine(HBWDID, productDID);
        HBWContract.assignStoreProductTask(processID, productDID, NFCID, color);
        emit ProcessStepStarted(processID, productDID, 4);
    }
}