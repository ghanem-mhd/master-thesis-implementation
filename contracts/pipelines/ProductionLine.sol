// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../../contracts/machines/VGR.sol";
import "../../contracts/machines/HBW.sol";
import "../../contracts/machines/SLD.sol";
import "../../contracts/machines/MPO.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductionLine is Ownable {

    using Counters for Counters.Counter;
    using AddressSet for AddressSet.Set;


    address private _VGRContractAddress = address(0);
    address private _HBWContractAddress = address(0);
    address private _MPOContractAddress = address(0);
    address private _SLDContractAddress = address(0);


    struct Product {
        uint createTime;
        mapping (bytes32 => string) info;
        bytes32[] infoNames;
    }
    AddressSet.Set private productsIDs;
    mapping (address => Product) products;


    modifier contractsReady(){
        require(
            _VGRContractAddress != address(0),
            "VGR contract address not assigned."
        );
        require(
            _HBWContractAddress != address(0),
            "HBW contract address not assigned."
        );
        require(
            _MPOContractAddress != address(0),
            "MPO contract address not assigned."
        );
        require(
            _SLDContractAddress != address(0),
            "SLD contract address not assigned."
        );
        _;
    }

    function setVGRContractAddress(address VGRContractAddress) public onlyOwner {
        _VGRContractAddress = VGRContractAddress;
    }

    function setHBWContractAddress(address HBWContractAddress) public onlyOwner {
        _HBWContractAddress = HBWContractAddress;
    }

    function setSLDContractAddress(address SLDContractAddress) public onlyOwner {
        _SLDContractAddress = SLDContractAddress;
    }

    function setMPOContractAddress(address MPOContractAddress) public onlyOwner {
        _MPOContractAddress = MPOContractAddress;
    }

    function order(address productID, string memory color) public contractsReady {
        saveProduct(productID);
        HBW(_HBWContractAddress).fetchWB(productID, color);
    }

    function onFetchWBFinished(address productID) public contractsReady {
        VGR(_VGRContractAddress).moveHBW2MPO(productID);
    }

    function onMoveHBW2MPOFinished(address productID) public contractsReady {
        HBW(_HBWContractAddress).storeContainer(productID);
        MPO(_MPOContractAddress).startProcessing(productID);
    }

    function onProcessingFinished(address productID) public contractsReady {
        SLD(_SLDContractAddress).startSorting(productID);
    }

    function onSortingFinished(uint taskID, address productID) public contractsReady {
        string memory color = SLD(_SLDContractAddress).getTaskOutput(taskID, "color");
        saveProductInfo(productID, "color", color);
        VGR(_VGRContractAddress).pickSorted(productID, color);
    }

    function saveProduct(address productID) internal {
        require(!productsIDs.exists(productID), "Product already exists.");
        productsIDs.insert(productID);
        Product storage product = products[productID];
        product.createTime = now;
    }

    function saveProductInfo(address productID, bytes32 infoName, string memory infoValue) internal {
        require(productsIDs.exists(productID), "Product doesn't exist.");
        products[productID].info[infoName] = infoValue;
        products[productID].infoNames.push(infoName);
    }

    function getProductInfo(address productID, bytes32 infoName) public view returns (string memory){
        require(productsIDs.exists(productID), "Product doesn't exist.");
        return (products[productID].info[infoName]);
    }

    function getProduct(address productID) public view returns(uint, bytes32 [] memory) {
        require(productsIDs.exists(productID), "Product doesn't exist.");
        return (products[productID].createTime,
            products[productID].infoNames
        );
    }
}