// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/Registry.sol";
import "../contracts/Product.sol";
import "../contracts/setTypes/UintSet.sol";
import "../contracts/setTypes/AddressSet.sol";
import "../contracts/setTypes/Bytes32Set.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Machine is Ownable {

    using Counters for Counters.Counter;
    using UintSet for UintSet.Set;
    using Bytes32Set for Bytes32Set.Set;
    using AddressSet for AddressSet.Set;

    constructor(address _machineOwner, address _machineDID, address _productContractAddress, address _regsitryContractAddress) public {
        machineOwner    = _machineOwner;
        machineDID      = _machineDID;
        productContract = Product(_productContractAddress);
        registryContact = Registry(_regsitryContractAddress);
        registryContact.registerMachine(getName(), address(this));
    }

    modifier onlyMachine(){
        require(_msgSender() == machineDID, "Only machine can call this function.");
        _;
    }

    modifier onlyMachineOwner(){
        require(_msgSender() == machineOwner, "Only machine owner can call this function.");
        _;
    }

    modifier onlyProcess(){
        require( authorizedProcesses.exists(_msgSender()) || (_msgSender() == machineOwner)  , "Only authorized process can call this function.");
        _;
    }

    modifier taskExists(uint taskID){
        require(tasksIds.exists(taskID), "Task doesn't exist.");
        _;
    }

    Product productContract;
    Registry registryContact;
    address public machineOwner;
    address public machineDID;
    mapping (bytes32 => bytes32) public info;
    Bytes32Set.Set private infoNames;

    function getMachineDID() public view returns(address) {
        return machineDID;
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

    enum TaskStatus {Assigned, Started, FinishedSuccessfully, FinishedUnsuccessfully, Killed }

    struct Task{
        address productDID;
        string taskName;
        uint startTimestamp;
        uint finishTimestamp;
        mapping (bytes32 => string) params;
        bytes32[] paramsNames;
        uint processID;
        address processContractAddress;
        address processOwner;
        TaskStatus status;
        string finishNote;
    }
    Counters.Counter private taskIDCounter;
    UintSet.Set private tasksIds;
    mapping (address => uint[]) private productsTasks;
    mapping (uint => Task) private tasks;
    event TaskAssigned(uint indexed taskID,
        string taskName,
        address indexed productDID,
        uint processID,
        address indexed processContractAddress,
        address processOwner);
    event TaskStarted(uint indexed taskID, string taskName, address indexed productDID, uint processID, address indexed processContractAddress);
    event TaskFinished(uint indexed taskID, string taskName, address indexed productDID,uint processID, address indexed processContractAddress, TaskStatus status);
    event TaskKilled(uint indexed taskID, string taskName, address indexed productDID,uint processID, address indexed processContractAddress);

    function assignTask(uint processID, address productDID, uint taskType) public virtual onlyProcess returns (uint){
        taskIDCounter.increment();
        uint newtaskID = taskIDCounter.current();
        tasksIds.insert(newtaskID);
        Task storage task           = tasks[newtaskID];
        task.taskName               = getTaskTypeName(taskType);
        task.productDID             = productDID;
        task.processID              = processID;
        task.processOwner           = tx.origin;
        task.processContractAddress = _msgSender();
        task.status                 = TaskStatus.Assigned;
        if(productDID != address(0)){
            productsTasks[productDID].push(newtaskID);
        }
        emit TaskAssigned(newtaskID, task.taskName, productDID, processID, _msgSender(), tx.origin);
        return newtaskID;
    }

    function startTask(uint taskID) public taskExists(taskID) onlyMachine {
        require(tasks[taskID].startTimestamp == 0, "Task already started.");

        tasks[taskID].status = TaskStatus.Started;
        tasks[taskID].startTimestamp = now;

        emit TaskStarted(taskID, getTaskName(taskID), tasks[taskID].productDID, tasks[taskID].processID, tasks[taskID].processContractAddress);
    }

    function finishTask(uint taskID, TaskStatus status, string memory finishNote) public taskExists(taskID) onlyMachine {
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].status = status;
        tasks[taskID].finishTimestamp = now;
        tasks[taskID].finishNote = finishNote;

        if (status == TaskStatus.FinishedUnsuccessfully) {
            saveAlert(taskID, finishNote, AlertType.Minor);
        }

        emit TaskFinished(taskID, getTaskName(taskID), tasks[taskID].productDID, tasks[taskID].processID, tasks[taskID].processContractAddress, status);
    }

    function killTask(uint taskID) public taskExists(taskID) onlyMachineOwner {
        require(tasks[taskID].finishTimestamp == 0, "Task already finished.");

        tasks[taskID].status = TaskStatus.Killed;
        tasks[taskID].finishTimestamp = now;

        emit TaskKilled(taskID, getTaskName(taskID), tasks[taskID].productDID, tasks[taskID].processID, tasks[taskID].processContractAddress);
    }

    function saveTaskParam(uint taskID, bytes32 inputName, string memory inputValue) public taskExists(taskID) onlyProcess {
        tasks[taskID].params[inputName] = inputValue;
        tasks[taskID].paramsNames.push(inputName);
    }

    function getTaskName(uint taskID) public taskExists(taskID) view returns (string memory) {
        return tasks[taskID].taskName;
    }

    function getTaskInput(uint taskID, bytes32 inputName) public taskExists(taskID) view returns (string memory){
        return (tasks[taskID].params[inputName]);
    }

    function getTask(uint taskID) public taskExists(taskID) view returns(address, string memory, uint, uint, string memory, TaskStatus){
        return (tasks[taskID].productDID,
            tasks[taskID].taskName,
            tasks[taskID].startTimestamp,
            tasks[taskID].finishTimestamp,
            tasks[taskID].finishNote,
            tasks[taskID].status
        );
    }

    function getTaskProcessInfo(uint taskID) public taskExists(taskID) view returns(uint, address, address){
        return (
            tasks[taskID].processID,
            tasks[taskID].processContractAddress,
            tasks[taskID].processOwner
        );
    }

    function getTaskStatus(uint taskID) public taskExists(taskID) view returns(TaskStatus) {
        return tasks[taskID].status;
    }

    function isTaskFinished(uint taskID) public taskExists(taskID) view returns(bool) {
      if (tasks[taskID].status == TaskStatus.FinishedSuccessfully || tasks[taskID].status == TaskStatus.FinishedUnsuccessfully ){
            return true;
        }else{
            return false;
        }
    }

    function getTasksCount() public view returns (uint) {
        return tasksIds.count();
    }

    function getProductTasks(address productDID) public view returns(uint[] memory){
        return productsTasks[productDID];
    }

    event ProductOperationSaved(uint operationID, uint indexed taskID, address indexed productDID, string operationName, string operationResult);

    function saveProductOperation(uint taskID, string memory operationName, string memory operationResult) public taskExists(taskID) onlyMachine {
        address productDID = tasks[taskID].productDID;
        uint operationID = productContract.saveProductOperation(productDID, taskID, operationName, operationResult);
        emit ProductOperationSaved(operationID, taskID, productDID, operationName, operationResult);
    }

    function saveIdentificationOperation(uint taskID, string memory physicalID) public taskExists(taskID) onlyMachine {
        address productDID = tasks[taskID].productDID;
        uint operationID = productContract.saveIdentificationOperation(productDID, taskID, physicalID);
        emit ProductOperationSaved(operationID, taskID, productDID, "Physical Identification", physicalID);
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

    function getProductID(uint taskID) public taskExists(taskID) view returns (address){
        return tasks[taskID].productDID;
    }

    enum ReadingType { Temperature, Humidity, AirPressure, GasResistance, Brightness }
    struct Reading{
        uint time;
        ReadingType readingType;
        int readingValue;
        uint taskID;
    }
    Counters.Counter private readingIDCounter;
    UintSet.Set private readingsIds;
    mapping (uint => Reading) private readings;
    event NewReading(ReadingType indexed readingType);

    function getNewReading(ReadingType readingType) public onlyMachineOwner {
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

    enum AlertType {Minor, Major, Urgent, Critical}

    struct Alert{
        uint time;
        uint taskID;
        string reason;
        AlertType alertType;
    }
    Counters.Counter private alertIDCounter;
    UintSet.Set private alertsIds;
    mapping (uint => Alert) private alerts;
    event NewAlert(uint indexed alertID, string reason, AlertType alertType);

    function saveAlert(uint taskID, string memory reason, AlertType alertType) internal onlyMachine {
        alertIDCounter.increment();
        uint newAlertID = alertIDCounter.current();

        alertsIds.insert(newAlertID);

        Alert storage alert = alerts[newAlertID];
        alert.time = now;
        alert.taskID = taskID;
        alert.reason = reason;
        alert.alertType = alertType;

        emit NewAlert(newAlertID, reason, alertType);
    }

    function getAlert(uint alertID) public view returns (uint, uint, string memory, AlertType) {
        require(alertsIds.exists(alertID), "Alert doesn't exist.");
        return (alerts[alertID].time,
            alerts[alertID].taskID,
            alerts[alertID].reason,
            alerts[alertID].alertType
        );
    }

    function getAlertsCount() public view returns (uint) {
        return alertsIds.count();
    }

    AddressSet.Set private authorizedProcesses;

    function authorizeProcess(address processContractAddress) public onlyMachineOwner {
        require(!authorizedProcesses.exists(processContractAddress), "Process already exist.");
        authorizedProcesses.insert(processContractAddress);
    }

    function deauthorizeProcess(address processContractAddress) public onlyMachineOwner {
        require(authorizedProcesses.exists(processContractAddress), "Process doesn't exist.");
        authorizedProcesses.remove(processContractAddress);
    }

    function getAuthorizedProcesses() public view returns (address [] memory) {
        return authorizedProcesses.keyList;
    }

    function getTasksTypesCount() public virtual pure returns(uint);
    function getTaskTypeName(uint taskType) public virtual pure returns(string memory);
    function getSymbol() public virtual pure returns (string memory);
    function getName() public virtual pure returns (string memory);
}