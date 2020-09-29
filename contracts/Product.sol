// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "../contracts/setTypes/UintSet.sol";

contract Product is ERC721  {

    using UintSet for UintSet.Set;
    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    Counters.Counter private tokensCounter;
    mapping (address => uint256) private productTokenMapping;
    mapping (string => address) private productPhysicalIDMapping;

    struct Operation{
        address machineDID;
        uint taskID;
        uint time;
        string name;
        string result;
    }
    Counters.Counter private operationsCounter;
    UintSet.Set private operationsIds;
    mapping (uint => Operation) private operations;
    mapping (address => uint[]) private productsOperations;
    mapping (address => mapping (string => uint)) productsOperationsNames;

    constructor() ERC721("Product", "PR") public {
    }

    // Modifiers
    modifier productExists(address productDID){
        require(productTokenMapping[productDID] != 0, "Product doesn't exist.");
        _;
    }

    function createProduct(address owner, address productDID) public returns (uint256) {
        require(productTokenMapping[productDID] == 0, "Product already exist.");
        tokensCounter.increment();
        uint256 tokenID = tokensCounter.current();
        _safeMint(owner, tokenID);
        productTokenMapping[productDID] = tokenID;
        return tokenID;
    }

    function ownerOfProduct(address productDID) public productExists(productDID) view returns (address){
        return super.ownerOf(productTokenMapping[productDID]);
    }

    function authorizeMachine(address machineDID, address productDID) public productExists(productDID) {
        super.approve(machineDID, productTokenMapping[productDID]);
    }

    function unauthorizeCurrentMachine(address productDID) public productExists(productDID) {
        super.approve(address(0), productTokenMapping[productDID]);
    }

    function getApprovedMachine(address productDID) public productExists(productDID) view returns(address){
        return super.getApproved(productTokenMapping[productDID]);
    }

    function getProductsCount() public view returns(uint){
        return tokensCounter.current();
    }

    function saveProductOperation(address productDID, uint taskID, string memory name, string memory result) productExists(productDID) public returns (uint){
        uint256 tokenID = productTokenMapping[productDID];
        require(getApproved(tokenID) == _msgSender(), "Sender is not approved for this operation.");
        operationsCounter.increment();
        uint opeationID = operationsCounter.current();
        operationsIds.insert(opeationID);
        Operation storage operation = operations[opeationID];
        operation.time              = now;
        operation.machineDID        = _msgSender();
        operation.taskID            = taskID;
        operation.name              = name;
        operation.result            = result;
        productsOperations[productDID].push(opeationID);
        productsOperationsNames[productDID][name] = opeationID;
        return opeationID;
    }

    function getProductOperation(uint opeationID) public view returns (address, uint, uint, string memory, string memory) {
        require(operationsIds.exists(opeationID), "Operation doesn't exist.");
        return (
            operations[opeationID].machineDID,
            operations[opeationID].taskID,
            operations[opeationID].time,
            operations[opeationID].name,
            operations[opeationID].result
        );
    }

    function getProductOperations(address productDID) public productExists(productDID) view returns(uint [] memory) {
        return (productsOperations[productDID]);
    }

    function saveIdentificationOperation(address productDID, uint taskID, string memory physicalID) public productExists(productDID)  {
        saveProductOperation(productDID, taskID, "Physical Identification", physicalID);
        productPhysicalIDMapping[physicalID] = productDID;
    }

    function getProductFromPhysicalID(string memory physicalID) public view returns (address) {
        return productPhysicalIDMapping[physicalID];
    }

    function getOperationResult(address productDID, string memory operationName) public productExists(productDID) view returns (string memory) {
        require(productsOperationsNames[productDID][operationName] != 0, "Operation doesn't exists.");
        uint operationID = productsOperationsNames[productDID][operationName];
        ( , , , , string memory result) = getProductOperation(operationID);
        return result;
    }

}