// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;


import "../../contracts/Product.sol";
import "../../contracts/setTypes/UintSet.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Process is Ownable {

    using UintSet for UintSet.Set;
    using Counters for Counters.Counter;

    constructor(address _processOwner, address _productContractAddress) public {
        processOwner = _processOwner;
        productContract = Product(_productContractAddress);
    }

    address public processOwner;

    modifier onlyProcessOwner(){
        require(_msgSender() == processOwner, "Only process owner can call this function.");
        _;
    }

    function getProcessOwner() public view returns(address) {
        return processOwner;
    }

    Counters.Counter private processesCounter;
    mapping (address => uint256) private productProcessMapping;
    mapping (uint256 => address) private processProductMapping;
    Product productContract;

    function startProcess(address productDID) internal returns(uint256) {
        processesCounter.increment();
        uint processID = processesCounter.current();

        productProcessMapping[productDID] = processID;
        processProductMapping[processID]  = productDID;

        return processID;
    }

    function getProcessID(address productDID) public view returns (uint256) {
        require(productProcessMapping[productDID] != 0, "No process for the given product.");
        return productProcessMapping[productDID];
    }

    function getProductDID(uint256 processID) public view returns (address) {
        require(processID != 0, "Process doesn't exists.");
        require(processesCounter.current() >= processID, "Process doesn't exists.");
        return processProductMapping[processID];
    }

    function getProcessesCount() public view returns (uint256) {
        return processesCounter.current();
    }

    function authorizeMachine(address machineContractAddress, address productDID) public {
        productContract.authorizeMachine(machineContractAddress, productDID);
    }

    function unauthorizeCurrentMachine(address productDID) public {
        productContract.unauthorizeCurrentMachine(productDID);
    }

    function getProductOperation(uint opeationID) public view returns (address, uint, uint, string memory, string memory) {
        return productContract.getProductOperation(opeationID);
    }

    function getProductOperations(address productDID) public view returns(uint [] memory) {
        return productContract.getProductOperations(productDID);
    }

    function getProductOperationResult(address productDID, string memory operationName) public view returns (string memory) {
        return productContract.getProductOperationResult(productDID, operationName);
    }
}