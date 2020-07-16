// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/Product.sol";
import "../contracts/RoleManager.sol";
import "../contracts/setTypes/UintSet.sol";
import "../contracts/setTypes/AddressSet.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


abstract contract ProductionLine is Ownable{

    using Counters for Counters.Counter;
    using UintSet for UintSet.Set;
    using AddressSet for AddressSet.Set;

    struct Task{
        string name;
        address device;
    }

    event TaskAssigned(address indexed device, string taskName);
    event ProductCreated(address indexed product, address indexed creator);

    address private _roleManagerContractAddress = address(0);
    address private _productContractAddress = address(0);

    AddressSet.Set private devicesIds;
    AddressSet.Set private productsIds;
    AddressSet.Set private tasksIds;

    mapping (address => address) productStatus;
    mapping (address => Task) tasks;

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

    function addTask(address taskId, string memory taskName) internal{
        require(!tasksIds.exists(taskId), "Task already exist.");
        tasksIds.insert(taskId);
        Task storage task = tasks[taskId];
        task.name = taskName;
        task.device = address(0);
    }

    function assignTask(address taskId, address deviceId) internal{
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        tasks[taskId].device = deviceId;
        emit TaskAssigned(deviceId, tasks[taskId].name);
    }

    function getDeviceAssigned(address taskId) public view returns (address){
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        return tasks[taskId].device;
    }

    function getTask(address taskId) public view returns (string memory name){
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        return tasks[taskId].name;
    }

    function executeTask(address product, address taskId) internal{
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        require(_productContractAddress != address(0), "Product contract not assigned.");
        require(tasks[taskId].device != address(0), "No device assign for the task.");

        productStatus[product] = taskId;
        Product(_productContractAddress).approveDevice(tasks[taskId].device, product);
    }

    function confirmTask(address product, address taskId) internal{
        require(tasksIds.exists(taskId), "Task doesn't exist.");
        require(_productContractAddress != address(0), "Product contract not assigned.");
        require(tasks[taskId].device != address(0), "No device assign for the task.");
        require(tasks[taskId].device == _msgSender(), "Task can only be confirmed by the assigned device.");

        Product(_productContractAddress).disapprove(product);
    }

    function createProduct(address product) internal{
        require(_productContractAddress != address(0), "Product contract not assigned.");
        Product(_productContractAddress).createProduct(address(this), product);
        emit ProductCreated(product, _msgSender());
    }
}