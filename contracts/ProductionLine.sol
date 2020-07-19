// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/Product.sol";
import "../contracts/RoleManager.sol";
import "../contracts/setTypes/UintSet.sol";
import "../contracts/setTypes/AddressSet.sol";
import "../contracts/setTypes/Bytes32Set.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


abstract contract ProductionLine is Ownable{

    using Counters for Counters.Counter;
    using UintSet for UintSet.Set;
    using AddressSet for AddressSet.Set;
    using Bytes32Set for Bytes32Set.Set;

    Counters.Counter private _taskIds;

    mapping (address => address) devicesAssigned;


    mapping (address => uint[]) productsTasks;
    mapping (address => uint[]) devicesTasks;

    struct Task{
        uint id;
        address device;
        address product;
        address taskType;
        uint executionTimestamp;
        uint finishationTimestamp;
        mapping (bytes32 => bytes32) params;
        bytes32[] paramsNames;
    }
    AddressSet.Set private taskTypes;

    UintSet.Set private tasksIds;
    mapping (uint => Task) tasks;

    event TaskTypeAssigned(address indexed taskType, address indexed device, bool status);
    event ProductCreated(address indexed product, address indexed creator);
    event NewTask(uint indexed taskId, address indexed device, address indexed product);

    function addTaskType(address taskType) internal{
        require(!taskTypes.exists(taskType), "Task already exist.");
        taskTypes.insert(taskType);
    }

    function assignTaskType(address taskType, address device) internal{
        require(taskTypes.exists(taskType), "Task type doesn't exist.");
        devicesAssigned[taskType] = device;
        emit TaskTypeAssigned(taskType, device, true);
    }

    function diassignTaskType(address taskType, address device) internal{
        require(taskTypes.exists(taskType), "Task type doesn't exist.");
        devicesAssigned[taskType] = address(0);
        emit TaskTypeAssigned(taskType, device, false);
    }

    function getDeviceAssigned(address taskType) public view returns (address){
        require(taskTypes.exists(taskType), "Task type doesn't exist.");
        return devicesAssigned[taskType];
    }

    function startTask(address product, address taskType) internal returns (uint){
        require(taskTypes.exists(taskType), "Task type doesn't exist.");
        require(_productContractAddress != address(0), "Product contract not assigned.");
        require(devicesAssigned[taskType] != address(0), "No device assign for the task.");

        Product(_productContractAddress).approveDevice(devicesAssigned[taskType], product);

        _taskIds.increment();
        uint256 newTaskId = _taskIds.current();


        tasksIds.insert(newTaskId);

        Task storage task = tasks[newTaskId];
        task.taskType = taskType;
        task.product = product;
        task.device = devicesAssigned[taskType];
        task.executionTimestamp = now;

        address device = getDeviceAssigned(taskType);

        emit NewTask(newTaskId, device, product);

        productsTasks[product].push(newTaskId);
        devicesTasks[device].push(newTaskId);

        return newTaskId;
    }

    function finishTask(address product, uint taskId) internal{
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        require(_productContractAddress != address(0), "Product contract not assigned.");

        address taskType  = tasks[taskId].taskType;
        
        require(devicesAssigned[taskType] != address(0), "No device assign for the task.");
        require(devicesAssigned[taskType] == _msgSender(), "Task can only be finished by the assigned device.");
        
        address approvedDevice = Product(_productContractAddress).getApprovedDevice(product);
        require(approvedDevice == _msgSender(), "Task can only be finished by the approved device.");

        Product(_productContractAddress).disapprove(product);

        tasks[taskId].finishationTimestamp = now;
    }

    function createProduct(address product) internal{
        require(_productContractAddress != address(0), "Product contract not assigned.");
        Product(_productContractAddress).createProduct(address(this), product);
        emit ProductCreated(product, _msgSender());
    }

    function addParam(uint taskId,bytes32 paramName, bytes32 paramValue) internal{
        tasks[taskId].params[paramName] = paramValue;
        tasks[taskId].paramsNames.push(paramName);
    }

    function getTask(uint taskId) public view returns(address, address, address, uint, uint, bytes32 [] memory){
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        return (tasks[taskId].device, 
            tasks[taskId].product,
            tasks[taskId].taskType,
            tasks[taskId].executionTimestamp,
            tasks[taskId].finishationTimestamp,
            tasks[taskId].paramsNames
        );
    }

    function getTaskParameter(uint taskId, bytes32 paramName) public view returns (bytes32){
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        return (tasks[taskId].params[paramName]);
    }

    address private _roleManagerContractAddress = address(0);
    address private _productContractAddress = address(0);

    function setRoleManagerContractAddress(address roleManagerContractAddress) public onlyOwner{
        _roleManagerContractAddress = roleManagerContractAddress;
    }

    function getRoleManagerContractAddress() public view returns(address){
        return _roleManagerContractAddress;
    }

    function setProductContractAddress(address productContractAddress) public onlyOwner{
        _productContractAddress = productContractAddress;
    }

    function getProductContractAddress() public view returns(address){
        return _productContractAddress;
    }

    function getProductTasks(address product) public view returns(uint[] memory){
        return productsTasks[product];
    }

    function getDeviceTasks(address device) public view returns(uint[] memory){
        return devicesTasks[device];
    }
}