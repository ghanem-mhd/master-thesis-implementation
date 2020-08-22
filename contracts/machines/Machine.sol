// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../../contracts/Product.sol";
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

    // the DID of machine owner
    address public machineOwner;
    // the DID of the machine
    address public machineID;
    // static information about the machine
    mapping (bytes32 => bytes32) public info;
    Bytes32Set.Set private infoNames;
    // set of allowed manufacturers to interact with this machine
    AddressSet.Set private manufacturers;

    constructor(address _machineOwner, address _machineID) public {
        machineOwner = _machineOwner;
        machineID = _machineID;
    }

    // Task
    struct Task{
        address product;
        string taskName;
        uint startTimestamp;
        uint finishTimestamp;
        mapping (bytes32 => string) params;
        bytes32[] paramsNames;
    }
    // counter to generate new task id
    Counters.Counter private taskIDCounter;
    // to store all tasks ids
    UintSet.Set private tasksIds;
    // for each product keep a list of all tasks performed on this product
    mapping (address => uint[]) private productsTasks;
    // map the taskID to the task struct
    mapping (uint => Task) private tasks;
    // current task
    uint private currentTaskID = 0;

    // Reading
    enum ReadingType { Temperature, Humidity, AirPressure, AirQuality }
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

    // Issues
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

    // Status
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

    // to notifiy the machine to perfome a task
    event NewTask(uint indexed taskID, string taskName);
    // to nitifiy others that a task has been finished
    event TaskFinished(uint indexed taskID);
    // to notifiy the machine to send a new reading from a certian type e.g. temperature..
    event NewReading(ReadingType indexed readingType);
    // to notifiy someone about the new issue
    event NewIssue(uint indexed issueID);
    // to notify the machine to send the status encoded
    event NewStatus();

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

    function getMachineID() public view returns(address) {
        return machineID;
    }

    function addInfo(bytes32 infoName, bytes32 infoValue) public onlyOwner {
        infoNames.insert(infoName);
        info[infoName] = infoValue;
    }

    function getMachineInfoNames() public view returns(bytes32 [] memory){
        return infoNames.keyList;
    }

    function getMachineInfo(bytes32 infoName) public view returns(bytes32){
        return info[infoName];
    }

    function createTask(address product, string memory taskName) internal onlyManufacturer returns (uint){

        taskIDCounter.increment();
        uint newtaskID = taskIDCounter.current();

        tasksIds.insert(newtaskID);

        Task storage task       = tasks[newtaskID];
        task.taskName           = taskName;
        task.product            = product;

        if(product != address(0)){
            productsTasks[product].push(newtaskID);
        }

        return newtaskID;
    }

    function startTask(uint taskID, string memory taskName) internal onlyManufacturer {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        require(tasks[taskID].startTimestamp == 0, "Task already started.");

        tasks[taskID].startTimestamp = now;

        currentTaskID = taskID;

        emit NewTask(taskID, taskName);
    }

    function finishTask(uint taskID) public onlyMachine {
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].finishTimestamp = now;

        currentTaskID = 0;

        emit TaskFinished(taskID);
    }

    function killTask(uint taskID) public onlyOwner{
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].finishTimestamp = 1;
    }

    function addParam(uint taskId, bytes32 paramName, string memory paramValue) internal{
        tasks[taskId].params[paramName] = paramValue;
        tasks[taskId].paramsNames.push(paramName);
    }

    function getTaskParameter(uint taskId, bytes32 paramName) public view returns (string memory){
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        return (tasks[taskId].params[paramName]);
    }

    function getTask(uint taskId) public view returns(address, string memory, uint, uint, bytes32 [] memory){
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        return (tasks[taskId].product,
            tasks[taskId].taskName,
            tasks[taskId].startTimestamp,
            tasks[taskId].finishTimestamp,
            tasks[taskId].paramsNames
        );
    }

    function getTasksCount() public view returns (uint) {
        return tasksIds.count();
    }

    function isTaskFinished(uint taskID) public view returns(bool){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        if (tasks[taskID].finishTimestamp != 0 || tasks[taskID].finishTimestamp == 1){
            return true;
        }else{
            return false;
        }
    }

    function getProductTasks(address product) public view returns(uint[] memory){
        return productsTasks[product];
    }

    function getNewReading(ReadingType readingType) public onlyOwner{
        emit NewReading(readingType);
    }

    function newReading(ReadingType readingType, int readingValue) internal onlyMachine returns(uint)  {
        readingIDCounter.increment();
        uint newReadingID = readingIDCounter.current();

        readingsIds.insert(newReadingID);

        Reading storage reading = readings[newReadingID];
        reading.time = now;
        reading.readingType = readingType;
        reading.readingValue = readingValue;
        if(currentTaskID != 0){
            reading.taskID = currentTaskID;
        }

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
        if(currentTaskID != 0){
            status.taskID = currentTaskID;
        }

        return newStatusID;
    }

    function authorizeManufacturer(address manufacturerAddress) public onlyMachineOwner {
        require(!manufacturers.exists(manufacturerAddress), "Manufacturer already exist.");
        manufacturers.insert(manufacturerAddress);
    }

    function deauthorizeManufacturer(address manufacturerAddress) public onlyMachineOwner {
        require(manufacturers.exists(manufacturerAddress), "Manufacturer doesn't exist.");
        manufacturers.remove(manufacturerAddress);
    }
}