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

    event TaskAssinged(address indexed device, string taskName);
    event ProductCreated(address indexed product, address indexed creator);

    address private _roleManagerContractAddress = address(0);
    address private _productContractAddress = address(0);

    AddressSet.Set private devicesIds;
    AddressSet.Set private productsIds;
    UintSet.Set private tasksIds;

    mapping (address => uint) productStatus;
    mapping (uint => Task) tasks;

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

    function addTask(uint taskIndex, string memory taskName) internal{
        require(taskIndex >= 1, "Task index must be greator than 1.");
        require(!tasksIds.exists(taskIndex), "Task already exist.");
        tasksIds.insert(taskIndex);
        Task storage task = tasks[taskIndex];
        task.name = taskName;
        task.device = address(0);
    }

    function assignTask(uint taskIndex, address deviceId) internal{
        require(tasksIds.exists(taskIndex), "Task doesn't exist.");
        tasks[taskIndex].device = deviceId;
        emit TaskAssinged(deviceId, tasks[taskIndex].name);
    }

    function getDeviceAssinged(uint taskIndex) public view returns (address){
        require(tasksIds.exists(taskIndex), "Task doesn't exist.");
        return tasks[taskIndex].device;
    }

    function getTask(uint taskIndex) public view returns (string memory name){
        require(tasksIds.exists(taskIndex), "Task doesn't exist.");
        return tasks[taskIndex].name;
    }

    function executeTask(address product, uint taskIndex) internal{
        require(tasksIds.exists(taskIndex), "Task doesn't exist.");
        require(_productContractAddress != address(0), "Product contract not assigned.");
        require(tasks[taskIndex].device != address(0), "No device assign for the task.");

        productStatus[product] = taskIndex;
        Product(_productContractAddress).approveDevice(tasks[taskIndex].device, product);
    }

    function confirmTask(address product, uint taskIndex) internal{
        require(tasksIds.exists(taskIndex), "Task doesn't exist.");
        require(_productContractAddress != address(0), "Product contract not assigned.");
        require(tasks[taskIndex].device != address(0), "No device assign for the task.");
        require(tasks[taskIndex].device == _msgSender(), "Task can only be confirmed by the assigned device.");

        Product(_productContractAddress).disapprove(product);
    }

    function createProduct(address product) internal{
        require(_productContractAddress != address(0), "Product contract not assigned.");
        Product(_productContractAddress).createProduct(address(this), product);
        emit ProductCreated(product, _msgSender());
    }
}