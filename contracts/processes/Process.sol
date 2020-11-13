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

    modifier processInstanceExists(uint processID){
        require(processID != 0 && processesCounter.current() >= processID, "Process doesn't exists.");
        _;
    }

    function getProcessOwner() public view returns(address) {
        return processOwner;
    }

    enum ProcessStatus { Started, FinishedSuccessfully, FinishedUnsuccessfully, Killed }

    struct ProcessInstance{
        address productDID;
        uint startingTime;
        uint finishingTime;
        ProcessStatus status;
        int currentStep;
    }
    mapping (uint => ProcessInstance) private instances;

    Counters.Counter private processesCounter;
    mapping (address => uint256) private productProcessMapping;
    Product productContract;

    function startProcess(address productDID) internal returns(uint256) {
        require (_msgSender() == productContract.getProductOwner(productDID), "Only product owner can call this function.");
        processesCounter.increment();
        uint processID = processesCounter.current();

        productProcessMapping[productDID] = processID;
        ProcessInstance storage instance = instances[processID];
        instance.startingTime = now;
        instance.productDID = productDID;
        instance.status = ProcessStatus.Started;
        instance.currentStep = 0;

        emit ProcessStarted(processID, productDID);

        return processID;
    }

    function startStep(uint processID, address productDID, int nextStep) public processInstanceExists(processID) onlyProcessOwner() {
        int currentStep = instances[processID].currentStep;
        require(currentStep == nextStep - 1, "Step can't be started in wrong order.");
        instances[processID].currentStep = nextStep;
        emit ProcessStepStarted(processID, productDID, nextStep);
    }

    function finishProcess(uint processID, ProcessStatus status) public processInstanceExists(processID) onlyProcessOwner() {
        require(instances[processID].finishingTime == 0, "Process already finished.");
        instances[processID].finishingTime = now;
        instances[processID].status = status;
        instances[processID].currentStep = -1;
        emit ProcessFinished(processID, instances[processID].productDID);
    }

    function killProcess(uint processID) public processInstanceExists(processID) onlyProcessOwner() {
        require(instances[processID].finishingTime == 0, "Process already finished.");
        instances[processID].finishingTime = now;
        instances[processID].status = ProcessStatus.Killed;
        emit ProcessKilled(processID, instances[processID].productDID);
    }

    function getProcessInstance(uint processID) public view processInstanceExists(processID) returns (address, uint, uint, ProcessStatus, int) {
        return (instances[processID].productDID,
            instances[processID].startingTime,
            instances[processID].finishingTime,
            instances[processID].status,
            instances[processID].currentStep
        );
    }

    function getProcessID(address productDID) public view returns (uint256) {
        require(productProcessMapping[productDID] != 0, "No process for the given product.");
        return productProcessMapping[productDID];
    }

    function getProductDID(uint256 processID) public view processInstanceExists(processID) returns (address) {
        return instances[processID].productDID;
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

    event ProcessStepStarted(uint indexed processID, address indexed productDID, int step);
    event ProcessStarted(uint indexed processID, address indexed productDID);
    event ProcessFinished(uint indexed processID, address indexed productDID);
    event ProcessKilled(uint indexed processID, address indexed productDID);
}