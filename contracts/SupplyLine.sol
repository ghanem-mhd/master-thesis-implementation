// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "../contracts/machines/VGR.sol";
import "../contracts/machines/HBW.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyLine is Ownable {

    address private _roleManagerContractAddress = address(0);
    address private _VGRContractAddress = address(0);
    address private _HBWContractAddress = address(0);

    modifier contractsReady(){
        require(
            _VGRContractAddress != address(0),
            "VGR contract address not assigned."
        );
        require(
            _HBWContractAddress != address(0),
            "HBW contract address not assigned."
        );
        _;
    }

    function setRoleManagerContractAddress(address roleManagerContractAddress) public onlyOwner {
        _roleManagerContractAddress = roleManagerContractAddress;
    }

    function setVGRContractAddress(address VGRContractAddress) public onlyOwner {
        _VGRContractAddress = VGRContractAddress;
    }

    function setHBWContractAddress(address HBWContractAddress) public onlyOwner {
        _HBWContractAddress = HBWContractAddress;
    }

    function getInfo() public contractsReady {
        VGR(_VGRContractAddress).getInfo();
    }

    function getInfoFinished(uint taskID) public contractsReady {
        string memory color = VGR(_VGRContractAddress).getTaskParameter(taskID, "color");
        string memory id    = VGR(_VGRContractAddress).getTaskParameter(taskID, "id");
        HBW(_HBWContractAddress).fetchContainer(id, color);
    }

    function fetchContainerFinished(uint taskID) public contractsReady{
        string memory color = VGR(_VGRContractAddress).getTaskParameter(taskID, "color");
        string memory id    = VGR(_VGRContractAddress).getTaskParameter(taskID, "id");
        VGR(_VGRContractAddress).hbwDrop(id, color);
    }

    function finishHbwDrop() public contractsReady{
        HBW(_HBWContractAddress).storeContainer();
    }
}