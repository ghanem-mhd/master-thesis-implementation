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

    function order(address productID, string memory color) public {
        //HBW(getAddress(Machines.HBW)).fetchWB(productID, color);
    }

    function onFetchWBFinished(address productID) public {
        //VGR(getAddress(Machines.VGR)).moveHBW2MPO(productID);
    }

    function onMoveHBW2MPOFinished(address productID) public {
        //HBW(getAddress(Machines.HBW)).storeContainer(productID);
        //MPO(getAddress(Machines.MPO)).process(productID);
    }

    function onProcessingFinished(address productID) public {
        //SLD(getAddress(Machines.SLD)).sort(productID);
    }

    function onSortingFinished(address productID) public {
        //string memory color = SLD(getAddress(Machines.SLD)).getProductOperationValue(productID, "ColorDetection");
        //VGR(getAddress(Machines.VGR)).pickSorted(productID, "");
    }
}