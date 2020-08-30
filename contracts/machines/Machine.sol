// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../../contracts/RoleManager.sol";
import "../../contracts/setTypes/UintSet.sol";
import "../../contracts/setTypes/StringSet.sol";
import "../../contracts/setTypes/AddressSet.sol";
import "../../contracts/setTypes/Bytes32Set.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Machine is Ownable {

    using Counters for Counters.Counter;
    using UintSet for UintSet.Set;
    using Bytes32Set for Bytes32Set.Set;
    using AddressSet for AddressSet.Set;

    constructor(address _machineOwner, address _machineID) public {
        machineOwner = _machineOwner;
        machineID = _machineID;
    }

    // Modifiers
    modifier onlyMachine(){
        require(_msgSender() == machineID, "Only machine can call this function.");
        _;
    }

    modifier onlyMachineOwner(){
        require(_msgSender() == machineOwner, "Only machine owner can call this function.");
        _;
    }

    modifier onlyManufacturer(){
        require( manufacturers.exists(_msgSender()) || (_msgSender() == machineOwner)  , "Only authorized manufactures can call this function.");
        _;
    }

    // Machine Info Structure
    address public machineOwner; // the DID of machine owner
    address public machineID;     // the DID of the machine
    mapping (bytes32 => bytes32) public info; // static information about the machine
    Bytes32Set.Set private infoNames;

    // Machine Info Methods

    function getMachineID() public view returns(address) {
        return machineID;
    }

    function getMachineOwner() public view returns(address) {
        return machineOwner;
    }

    function saveMachineInfo(bytes32 infoName, bytes32 infoValue) public onlyMachineOwner {
        infoNames.insert(infoName);
        info[infoName] = infoValue;
    }

    function getMachineInfoNames() public view returns(bytes32 [] memory){
        return infoNames.keyList;
    }

    function getMachineInfo(bytes32 infoName) public view returns(bytes32){
        return info[infoName];
    }

    // Task Structure
    struct Task{
        address productID;
        string taskName;
        uint startTimestamp;
        uint finishTimestamp;
        mapping (bytes32 => string) inputs;
        bytes32[] inputsNames;
        mapping (bytes32 => string) outputs;
        bytes32[] outputsNames;
    }
    // counter to generate new task id
    Counters.Counter private taskIDCounter;
    // to store all tasks ids
    UintSet.Set private tasksIds;
    // for each product keep a list of all tasks performed on this product
    mapping (address => uint[]) private productsTasks;
    // map the taskID to the task struct
    mapping (uint => Task) private tasks;

    // Task Eevents
    event NewTask(uint indexed taskID, string taskName, address productID);     // to notifiy the machine to perfome a task
    event TaskFinished(uint indexed taskID, string taskName, address productID);// to nitifiy others that a task has been finished

    // Tasks Methods
    function createTask(address productID, string memory taskName) internal onlyManufacturer returns (uint){

        taskIDCounter.increment();
        uint newtaskID = taskIDCounter.current();

        tasksIds.insert(newtaskID);

        Task storage task       = tasks[newtaskID];
        task.taskName           = taskName;
        task.productID          = productID;

        if(productID != address(0)){
            productsTasks[productID].push(newtaskID);
            if (!productsIDs.exists(productID)){
                saveProduct(productID);
            }
        }

        return newtaskID;
    }

    function startTask(uint taskID) internal onlyManufacturer {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        require(tasks[taskID].startTimestamp == 0, "Task already started.");

        tasks[taskID].startTimestamp = now;

        emit NewTask(taskID, getTaskName(taskID), tasks[taskID].productID);
    }

    function finishTask(uint taskID) public onlyMachine {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].finishTimestamp = now;

        emit TaskFinished(taskID, getTaskName(taskID), tasks[taskID].productID);
    }

    function killTask(uint taskID) public onlyMachineOwner {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].finishTimestamp = 1;
    }

    function saveInput(uint taskID, bytes32 inputName, string memory inputValue) public onlyManufacturer {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        tasks[taskID].inputs[inputName] = inputValue;
        tasks[taskID].inputsNames.push(inputName);
    }

    function saveOutput(uint taskID, bytes32 outputName, string memory outputValue) public onlyMachine {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        tasks[taskID].outputs[outputName] = outputValue;
        tasks[taskID].outputsNames.push(outputName);
    }

    function isTaskFinished(uint taskID) public view returns(bool){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        if (tasks[taskID].finishTimestamp != 0 || tasks[taskID].finishTimestamp == 1){
            return true;
        }else{
            return false;
        }
    }

    function getTaskName(uint taskID) public view returns (string memory) {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        return tasks[taskID].taskName;
    }

    function getTaskInput(uint taskID, bytes32 inputName) public view returns (string memory){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        return (tasks[taskID].inputs[inputName]);
    }

    function getTaskOutput(uint taskID, bytes32 outputName) public view returns (string memory){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        return (tasks[taskID].outputs[outputName]);
    }

    function getTask(uint taskID) public view returns(address, string memory, uint, uint, bytes32 [] memory, bytes32 [] memory){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        return (tasks[taskID].productID,
            tasks[taskID].taskName,
            tasks[taskID].startTimestamp,
            tasks[taskID].finishTimestamp,
            tasks[taskID].inputsNames,
            tasks[taskID].outputsNames
        );
    }

    function getTasksCount() public view returns (uint) {
        return tasksIds.count();
    }

    function getProductTasks(address productID) public view returns(uint[] memory){
        return productsTasks[productID];
    }

    // Product Structure
    enum ProductStatus {Pending, Done}
    struct Product {
        ProductStatus status;
        mapping (bytes32 => string) info;
        bytes32[] infoNames;
    }
    AddressSet.Set private productsIDs;
    mapping (address => Product) products;

    // Product Methods
    function saveProduct(address productID) internal {
        require(!productsIDs.exists(productID), "Product already exists.");
        productsIDs.insert(productID);
        Product storage product = products[productID];
        product.status = ProductStatus.Pending;
    }

    function saveProductInfo(uint taskID, bytes32 infoName, string memory infoValue) internal {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        address productID = tasks[taskID].productID;
        require(productsIDs.exists(productID), "Product doesn't exist.");
        products[productID].info[infoName] = infoValue;
        products[productID].infoNames.push(infoName);
    }

    function getProductInfo(address productID, bytes32 infoName) public view returns (string memory){
        require(productsIDs.exists(productID), "Product doesn't exist.");
        return (products[productID].info[infoName]);
    }

    function getProductInfo(uint taskID, bytes32 infoName) public view returns (string memory){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        address productID = tasks[taskID].productID;
        require(productsIDs.exists(productID), "Product doesn't exist.");
        return (products[productID].info[infoName]);
    }

    function getProduct(address productID) public view returns(ProductStatus, bytes32 [] memory) {
        require(productsIDs.exists(productID), "Product doesn't exist.");
        return (products[productID].status,
            products[productID].infoNames
        );
    }

    function getProductID(uint taskID) public view returns (address){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        return tasks[taskID].productID;
    }

    // Reading Structure
    enum ReadingType { Temperature, Humidity, AirPressure, GasResistance, Brightness }
    struct Reading{
        uint time;
        ReadingType readingType;
        int readingValue;
        uint taskID;
    }
    // counter to generate new reading id
    Counters.Counter private readingIDCounter;
    // to store all reading ids
    UintSet.Set private readingsIds;
    // map the readingID to the reading struct
    mapping (uint => Reading) private readings;

    // Reading Events
    // to notifiy the machine to send a new reading from a certian type e.g. temperature..
    event NewReading(ReadingType indexed readingType);

    // Reading Methods
    function getNewReading(ReadingType readingType) public onlyOwner{
        emit NewReading(readingType);
    }

    function saveReading(uint taskID, ReadingType readingType, int readingValue) internal onlyMachine returns(uint)  {
        readingIDCounter.increment();
        uint newReadingID = readingIDCounter.current();

        readingsIds.insert(newReadingID);

        Reading storage reading = readings[newReadingID];
        reading.time = now;
        reading.readingType = readingType;
        reading.readingValue = readingValue;
        reading.taskID = taskID;

        return newReadingID;
    }

    function getReading(uint readingID) public view returns(uint, ReadingType, int, uint){
        require(readingsIds.exists(readingID), "Reading doesn't exist.");
        return (readings[readingID].time,
            readings[readingID].readingType,
            readings[readingID].readingValue,
            readings[readingID].taskID
        );
    }

    function getReadingsCount() public view returns (uint) {
        return readingsIds.count();
    }

    // Issues Structure
    struct Issue{
        uint time;
        uint readingID;
        string reason;
    }
    // counter to generate new issue id
    Counters.Counter private issueIDCounter;
    // to store all issues ids
    UintSet.Set private issuesIds;
    // map the issueID to the issue struct
    mapping (uint => Issue) private issues;

    // Issue Events
    // to notifiy someone about the new issue
    event NewIssue(uint indexed issueID);

    // Issue Methods

    function newIssue(uint readingID, string memory reason) internal onlyMachine {
        issueIDCounter.increment();
        uint newIssueID = issueIDCounter.current();

        issuesIds.insert(newIssueID);

        Issue storage issue = issues[newIssueID];
        issue.time = now;
        issue.readingID = readingID;
        issue.reason = reason;

        emit NewIssue(newIssueID);
    }

    // Status Structure
    struct Status{
        uint time;
        string encodedStatus;
        uint taskID;
    }
    // counter to generate new status id
    Counters.Counter private statusIDCounter;
    // to store all statuses ids
    UintSet.Set private statusIds;
    // map the statusID to the status struct
    mapping (uint => Status) private statuses;

    // Status Events
    // to notify the machine to send the status encoded
    event NewStatus();

    // Status Methods
    function getNewStatus() public onlyOwner{
        emit NewStatus();
    }

    function newStatus(string memory encodedStatus) public onlyMachine returns(uint)  {
        statusIDCounter.increment();
        uint newStatusID = statusIDCounter.current();

        statusIds.insert(newStatusID);

        Status storage status = statuses[newStatusID];
        status.time = now;
        status.encodedStatus = encodedStatus;

        return newStatusID;
    }

    // Manufacturers Methods
    AddressSet.Set private manufacturers; // set of allowed manufacturers to interact with this machine

    function authorizeManufacturer(address manufacturerAddress) public onlyMachineOwner {
        require(!manufacturers.exists(manufacturerAddress), "Manufacturer already exist.");
        manufacturers.insert(manufacturerAddress);
    }

    function deauthorizeManufacturer(address manufacturerAddress) public onlyMachineOwner {
        require(manufacturers.exists(manufacturerAddress), "Manufacturer doesn't exist.");
        manufacturers.remove(manufacturerAddress);
    }
}