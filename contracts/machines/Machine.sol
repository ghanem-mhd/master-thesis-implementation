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

    constructor(address _machineOwner, address _machineID, address _productContractAddress) public {
        machineOwner    = _machineOwner;
        machineID       = _machineID;
        productContract = Product(_productContractAddress);
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
        require( manufacturers.exists(tx.origin) || (tx.origin == machineOwner)  , "Only authorized manufactures can call this function.");
        _;
    }

    modifier onlyMaintainer(){
        require( maintainers.exists(_msgSender()) || (_msgSender() == machineOwner)  , "Only authorized maintainers can call this function.");
        _;
    }

    modifier taskExists(uint taskID){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        _;
    }

    // Product Contract
    Product productContract;

    // Machine Info Structure
    address public machineOwner; // the DID of machine owner
    address public machineID;    // the DID of the machine
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
        address productDID;
        string taskName;
        uint startTimestamp;
        uint finishTimestamp;
        mapping (bytes32 => string) params;
        bytes32[] paramsNames;
        uint processID;
        address processContractAddress;
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
    // to notifiy the machine to perfome a task
    event TaskAssigned(uint indexed taskID, string taskName, address productDID, uint processID, address processContractAddress);
    // to notifiy others that a task has been finished
    event TaskStarted(uint indexed taskID, string taskName, address productDID, uint processID, address processContractAddress);
    // to notifiy others that a task has been finished
    event TaskFinished(uint indexed taskID, string taskName, address productDID,uint processID, address processContractAddress);

    // Tasks Methods
    function assignTask(uint processID, address productDID, string memory taskName) internal onlyManufacturer returns (uint){
        taskIDCounter.increment();
        uint newtaskID = taskIDCounter.current();
        tasksIds.insert(newtaskID);
        Task storage task       = tasks[newtaskID];
        task.taskName           = taskName;
        task.productDID         = productDID;
        task.processID          = processID;
        task.processContractAddress = _msgSender();
        if(productDID != address(0)){
            productsTasks[productDID].push(newtaskID);
        }
        emit TaskAssigned(newtaskID, getTaskName(newtaskID), productDID, processID, _msgSender());
        return newtaskID;
    }

    function startTask(uint taskID) public taskExists(taskID) onlyMachine {
        require(tasks[taskID].startTimestamp == 0, "Task already started.");

        tasks[taskID].startTimestamp = now;

        emit TaskStarted(taskID, getTaskName(taskID), tasks[taskID].productDID, tasks[taskID].processID, tasks[taskID].processContractAddress);
    }

    function finishTask(uint taskID) public taskExists(taskID) onlyMachine {
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].finishTimestamp = now;

        emit TaskFinished(taskID, getTaskName(taskID), tasks[taskID].productDID, tasks[taskID].processID, tasks[taskID].processContractAddress);
    }

    function killTask(uint taskID) public taskExists(taskID) onlyMachineOwner {
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].finishTimestamp = 1;
    }

    function saveTaskParam(uint taskID, bytes32 inputName, string memory inputValue) public taskExists(taskID) onlyManufacturer {
        tasks[taskID].params[inputName] = inputValue;
        tasks[taskID].paramsNames.push(inputName);
    }

    function isTaskFinished(uint taskID) public taskExists(taskID) view returns(bool){
        if (tasks[taskID].finishTimestamp != 0 || tasks[taskID].finishTimestamp == 1){
            return true;
        }else{
            return false;
        }
    }

    function getTaskName(uint taskID) public taskExists(taskID) view returns (string memory) {
        return tasks[taskID].taskName;
    }

    function getTaskInput(uint taskID, bytes32 inputName) public taskExists(taskID) view returns (string memory){
        return (tasks[taskID].params[inputName]);
    }

    function getTask(uint taskID) public taskExists(taskID) view returns(address, string memory, uint, uint, bytes32 [] memory){
        return (tasks[taskID].productDID,
            tasks[taskID].taskName,
            tasks[taskID].startTimestamp,
            tasks[taskID].finishTimestamp,
            tasks[taskID].paramsNames
        );
    }

    function getTasksCount() public view returns (uint) {
        return tasksIds.count();
    }

    function getProductTasks(address productDID) public view returns(uint[] memory){
        return productsTasks[productDID];
    }

    // Product Operations Structure
    AddressSet.Set private productsIDs;
    mapping (address => mapping (bytes32 => string)) productsOperations;
    mapping (address => bytes32[]) operationsNames;

    // Product Methods

    function saveProductOperation(uint taskID, string memory operationName, string memory operationResult) public taskExists(taskID) onlyMachine {
        address productDID = tasks[taskID].productDID;
        productContract.saveProductOperation(productDID, taskID, operationName, operationResult);
    }

    function getProductOperation(uint opeationID) public view returns (address, uint, uint, string memory, string memory) {
        return productContract.getProductOperation(opeationID);
    }

    function getProductOperations(address productDID) public view returns(uint [] memory) {
        return productContract.getProductOperations(productDID);
    }

    function getProductID(uint taskID) public taskExists(taskID) view returns (address){
        return tasks[taskID].productDID;
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

    enum IssueType {Minor, Major, Urgent, Critical}

    function getIssueType(IssueType issueType) internal pure returns (string memory) {
        require(uint8(issueType) <= 4);
        if (IssueType.Minor == issueType) return "Minor";
        if (IssueType.Major == issueType) return "Major";
        if (IssueType.Urgent == issueType) return "Urgent";
        if (IssueType.Critical == issueType) return "Critical";
    }
    // Issues Structure
    struct Issue{
        uint time;
        uint readingID;
        string reason;
        string issueType;
    }
    // counter to generate new issue id
    Counters.Counter private issueIDCounter;
    // to store all issues ids
    UintSet.Set private issuesIds;
    // map the issueID to the issue struct
    mapping (uint => Issue) private issues;

    // Issue Events
    // to notifiy someone about the new issue
    event NewIssue(uint indexed issueID, string reason, string issueType);

    // Issue Methods

    function saveIssue(uint readingID, string memory reason, IssueType issueType) internal onlyMachine {
        issueIDCounter.increment();
        uint newIssueID = issueIDCounter.current();

        issuesIds.insert(newIssueID);

        Issue storage issue = issues[newIssueID];
        issue.time = now;
        issue.readingID = readingID;
        issue.reason = reason;

        string memory issueTypeName = getIssueType(issueType);
        issue.issueType = issueTypeName;

        emit NewIssue(newIssueID, reason, issueTypeName);
    }

    function getIssue(uint issueID) public view returns (uint, uint, string memory, string memory) {
        require(issuesIds.exists(issueID), "Issue doesn't exist.");
        return (issues[issueID].time,
            issues[issueID].readingID,
            issues[issueID].reason,
            issues[issueID].issueType
        );
    }

    function getIssuesCount() public view returns (uint) {
        return issuesIds.count();
    }

    // Maintenance Structure
    struct MaintenanceOperation {
        uint time;
        address maintainer;
        string description;
    }
    Counters.Counter private maintenanceOperationIDCounter;
    UintSet.Set private maintenanceOperationsIds;
    mapping (uint => MaintenanceOperation) private maintenanceOperations;

    // Maintenance events
    event NewMaintenanceOperation(uint indexed maintenanceOperationID, address indexed maintainer, string description);

    function saveMaintenanceOperation(string memory description) public onlyMaintainer returns(uint)  {
        maintenanceOperationIDCounter.increment();
        uint newID = maintenanceOperationIDCounter.current();

        maintenanceOperationsIds.insert(newID);

        MaintenanceOperation storage maintenanceOperation = maintenanceOperations[newID];
        maintenanceOperation.time = now;
        maintenanceOperation.maintainer = _msgSender();
        maintenanceOperation.description = description;

        emit NewMaintenanceOperation(newID, _msgSender(), description);

        return newID;
    }

    function getMaintenanceOperation(uint maintenanceOperationID) public view returns (uint, address, string memory) {
        require(maintenanceOperationsIds.exists(maintenanceOperationID), "MaintenanceOperation doesn't exist.");
        return (maintenanceOperations[maintenanceOperationID].time,
            maintenanceOperations[maintenanceOperationID].maintainer,
            maintenanceOperations[maintenanceOperationID].description
        );
    }

    function getMaintenanceOperationsCount() public view returns (uint) {
        return maintenanceOperationsIds.count();
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

    function getAuthorizedManufacturers() public view returns (address [] memory) {
        return manufacturers.keyList;
    }

    // Maintainers Methods
    AddressSet.Set private maintainers; // set of allowed maintainers to maintain the machine

    function authorizeMaintainer(address maintainerAddress) public onlyMachineOwner {
        require(!maintainers.exists(maintainerAddress), "Maintainer already exist.");
        maintainers.insert(maintainerAddress);
    }

    function deauthorizeMaintainer(address maintainerAddress) public onlyMachineOwner {
        require(maintainers.exists(maintainerAddress), "Maintainer doesn't exist.");
        maintainers.remove(maintainerAddress);
    }

    function getAuthorizedMaintainers() public view returns (address [] memory) {
        return maintainers.keyList;
    }
}