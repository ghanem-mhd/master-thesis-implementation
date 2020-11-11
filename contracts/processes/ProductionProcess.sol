// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "./Process.sol";
import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/machines/SLD.sol";
import "../../contracts/machines/MPO.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductionProcess is Process {

    VGR public VGRContract;
    HBW public HBWContract;
    SLD public SLDContract;
    MPO public MPOContract;

    constructor(address _processOwner, address _productContractAddress) Process(_processOwner, _productContractAddress) public {}

    function setVGRContractAddress(address VGRContractAddress) public onlyProcessOwner {
       VGRContract = VGR(VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public onlyProcessOwner {
       HBWContract = HBW(HBWContractAddress);
    }

    function setSLDContractAddress(address SLDContractAddress) public onlyProcessOwner {
       SLDContract = SLD(SLDContractAddress);
    }

    function setMPOContractAddress(address MPOContractAddress) public onlyProcessOwner {
        MPOContract = MPO(MPOContractAddress);
    }

    function startProductionProcess(address productDID) public {
        super.startProcess(productDID);
    }

    function step1(uint processID) public onlyProcessOwner {
        address HBWDID      = HBWContract.getMachineID();
        address productDID  = super.getProductDID(processID);
        super.authorizeMachine(HBWDID, productDID);
        HBWContract.assignFetchProductTask(processID, productDID);
        super.startStep(processID, productDID, 1);
    }

    function step2(uint processID) public onlyProcessOwner {
        address VGRDID     = VGRContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignMoveHBW2MPOTask(processID, productDID);
        super.startStep(processID, productDID, 2);
    }

    function step3(uint processID) public onlyProcessOwner {
        address MPODID      = MPOContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(MPODID, productDID);
        HBWContract.assignStoreContainerTask(processID);
        MPOContract.assignProcessingTask(processID, productDID);
        super.startStep(processID, productDID, 3);
    }

    function step4(uint processID) public onlyProcessOwner {
        address SLDDID     = SLDContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(SLDDID, productDID);
        SLDContract.assignSortingTask(processID, productDID);
        super.startStep(processID, productDID, 4);
    }

    function step5(uint processID) public onlyProcessOwner {
        address VGRDID      = VGRContract.getMachineID();
        address productDID  = super.getProductDID(processID);
        string memory color = super.getProductOperationResult(productDID, "Sorting");
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignPickSortedTask(processID, productDID, color);
        super.startStep(processID, productDID, 5);
    }
}