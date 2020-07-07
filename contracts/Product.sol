// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";

contract Product is ERC721  {

    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    Counters.Counter private _productIds;
    EnumerableMap.UintToAddressMap private tokenProductMapping;
    mapping (address => uint256) private productTokenMapping;

    constructor() ERC721("Product", "PR") public {
    }

    function createProduct(address owner, address product) public returns (uint256) {
        _productIds.increment();
        uint256 newProductId = _productIds.current();
        _mint(owner, newProductId);
        tokenProductMapping.set(newProductId, product);
        productTokenMapping[product] = newProductId;
        return newProductId;
    }

    function transferProduct(address from, address to, address product) public{
        require(productTokenMapping[product] != 0, "Product not found.");
        safeTransferFrom(from, to, productTokenMapping[product]);
    }

    function ownerOfProduct(address product) public view returns (address){
        require(productTokenMapping[product] != 0, "Product not found.");
        return super.ownerOf(productTokenMapping[product]);
    }

    function approveDevice(address device, address product) public{
        require(productTokenMapping[product] != 0, "Product not found.");
        super.approve(device, productTokenMapping[product]);
    }

    function disapprove(address product) public{
        require(productTokenMapping[product] != 0, "Product not found.");
        super.approve(address(0), productTokenMapping[product]);
    }

    function getApprovedDevice(address product) public view returns(address){
        require(productTokenMapping[product] != 0, "Product not found.");
        return super.getApproved(productTokenMapping[product]);
    }
}