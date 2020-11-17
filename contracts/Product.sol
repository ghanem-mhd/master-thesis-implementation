// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "../contracts/setTypes/UintSet.sol";
import "../contracts/setTypes/Bytes32Set.sol";

contract Product is Ownable {

    using UintSet for UintSet.Set;
    using Bytes32Set for Bytes32Set.Set;
    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    Counters.Counter private productsCount;
    mapping (uint => address) private productIDMapping;
    mapping (address => uint) private productIDReverseMapping;
    mapping (string => address) private productPhysicalIDMapping;

    mapping (address => mapping (bytes32 => bytes32)) proudctsInfo;
    mapping (address => bytes32[]) private productsInfoNames;
    mapping (address => uint) private productsCreationTime;

    struct Operation{
        address machineDID;
        uint taskID;
        uint time;
        string name;
        string result;
    }
    Counters.Counter private operationsCounter;
    UintSet.Set private operationsIds;

    mapping (address => address) private productsOwners;
    mapping (address => address) private productsAuthorizedProcesses;
    mapping (address => address) private productsAuthorizedMachines;

    mapping (uint => Operation) private operations;
    mapping (address => uint[]) private productsOperations;
    mapping (address => mapping (string => uint)) productsOperationsNames;


    // Modifiers
    modifier productExists(address productDID){
        require(productsOwners[productDID] != address(0), "Product doesn't exist.");
        _;
    }

    modifier onlyProductOwner(address productDID){
        require(productsOwners[productDID] != address(0) &&
        (tx.origin == productsOwners[productDID]),
        "Only product owner can call this function.");
        _;
    }

    modifier onlyAuthorizeProcessOrOwner(address productDID){
        require( (_msgSender() == productsOwners[productDID]) ||
        (productsAuthorizedProcesses[productDID] != address(0) && (_msgSender() == productsAuthorizedProcesses[productDID])),
        "Only authorize process can call this function.");
        _;
    }

    modifier onlyAuthorizeMachine(address productDID){
        require( (_msgSender() == productsOwners[productDID]) ||
        ( productsAuthorizedMachines[productDID] != address(0) && (_msgSender() == productsAuthorizedMachines[productDID])),
        "Only authorize machine can call this function.");
        _;
    }

    function createProduct(address productDID) public {
        require(productsOwners[productDID] == address(0), "Product already exist.");
        productsOwners[productDID] = _msgSender();
        productsCount.increment();
        productsCreationTime[productDID] = now;
        productIDMapping[productsCount.current()] = productDID;
        productIDReverseMapping[productDID] = productsCount.current();
    }

    function getProductOwner(address productDID) public productExists(productDID) view returns (address){
        return productsOwners[productDID];
    }

    function getProductCreationTime(address productDID) public productExists(productDID) view returns (uint){
        return productsCreationTime[productDID];
    }

    function authorizeProcess(address processContractAddress, address productDID) public productExists(productDID) onlyProductOwner(productDID)  {
        productsAuthorizedProcesses[productDID] = processContractAddress;
    }

    function unauthorizeCurrentProcess(address productDID) public productExists(productDID) onlyProductOwner(productDID) {
        productsAuthorizedProcesses[productDID] = address(0);
    }

    function getAuthorizeProcess(address productDID) public productExists(productDID) view returns(address){
        return productsAuthorizedProcesses[productDID];
    }

    function authorizeMachine(address machineDID, address productDID) public productExists(productDID) onlyAuthorizeProcessOrOwner(productDID)  {
        productsAuthorizedMachines[productDID] = machineDID;
    }

    function unauthorizeCurrentMachine(address productDID) public productExists(productDID) onlyAuthorizeProcessOrOwner(productDID) {
        productsAuthorizedMachines[productDID] = address(0);
    }

    function getAuthorizedMachine(address productDID) public productExists(productDID) view returns(address){
        return productsAuthorizedMachines[productDID];
    }

    function getProductsCount() public view returns(uint){
        return productsCount.current();
    }

    function saveProductOperation(address productDID, uint taskID, string memory name, string memory result) productExists(productDID) onlyAuthorizeMachine(productDID) public returns (uint){
        operationsCounter.increment();
        uint opeationID = operationsCounter.current();
        operationsIds.insert(opeationID);
        Operation storage operation = operations[opeationID];
        operation.time              = now;
        operation.machineDID        = tx.origin;
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

    function getProductOperationResult(address productDID, string memory operationName) public productExists(productDID) view returns (string memory) {
        require(productsOperationsNames[productDID][operationName] != 0, "Operation doesn't exist.");
        uint operationID = productsOperationsNames[productDID][operationName];
        ( , , , , string memory result) = getProductOperation(operationID);
        return result;
    }

    function saveProductInfo(address productDID, bytes32 infoName, bytes32 infoValue) public productExists(productDID) onlyProductOwner(productDID) {
        productsInfoNames[productDID].push(infoName);
        proudctsInfo[productDID][infoName] = infoValue;
    }

    function getProductInfoNames(address productDID) public productExists(productDID) view returns(bytes32 [] memory) {
        return productsInfoNames[productDID];
    }

    function getProductInfo(address productDID, bytes32 infoName) public productExists(productDID) view returns(bytes32)  {
        return proudctsInfo[productDID][infoName];
    }

    function getProductID(address productDID) public productExists(productDID) view returns(uint) {
        return productIDReverseMapping[productDID];
    }

    function getProductDID(uint productID) public view returns (address) {
        require(productID >= 1, "Wrong product ID");
        require(productIDMapping[productID] != address(0), "Product doesn't exist");
        return productIDMapping[productID];
    }
}