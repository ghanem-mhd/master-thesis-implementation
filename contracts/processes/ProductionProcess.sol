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

    VGR private VGRContract;
    HBW private HBWContract;
    SLD private SLDContract;
    MPO private MPOContract;

    constructor(address _productContractAddress) Process(_productContractAddress) public {}

    function setVGRContractAddress(address VGRContractAddress) public {
       VGRContract = VGR(VGRContractAddress);
    }

    function setHBWContractAddress(address HBWContractAddress) public {
       HBWContract = HBW(HBWContractAddress);
    }

    function setSLDContractAddress(address SLDContractAddress) public {
       SLDContract = SLD(SLDContractAddress);
    }

    function setMPOContractAddress(address MPOContractAddress) public {
        MPOContract = MPO(MPOContractAddress);
    }

    function startProductionProcess(address productDID) public {
        uint processID = super.startProcess(productDID);
        step1(processID);
    }

    function step1(uint processID) public {
        address HBWDID      = HBWContract.getMachineID();
        address productDID  = super.getProductDID(processID);
        super.authorizeMachine(HBWDID, productDID);
        HBWContract.assignFetchProductTask(processID, productDID);
    }

    function step2(uint processID) public {
        address VGRDID     = VGRContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignMoveHBW2MPOTask(processID, productDID);
    }

    function step3(uint processID) public {
        address MPODID      = MPOContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(MPODID, productDID);
        HBWContract.assignStoreContainerTask(processID);
        MPOContract.assignProcessingTask(processID, productDID);
    }

    function step4(uint processID) public {
        address SLDDID     = SLDContract.getMachineID();
        address productDID = super.getProductDID(processID);
        super.authorizeMachine(SLDDID, productDID);
        SLDContract.assignSortingTask(processID, productDID);
    }

    function step5(uint processID) public {
        address VGRDID      = VGRContract.getMachineID();
        address productDID  = super.getProductDID(processID);
        string memory color = super.getProductOperationResult(productDID, "Sorting");
        super.authorizeMachine(VGRDID, productDID);
        VGRContract.assignPickSortedTask(processID, productDID, color);
    }
}