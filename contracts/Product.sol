// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";

contract Product is ERC721 {

    using Counters for Counters.Counter;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    Counters.Counter private _productIds;
    EnumerableMap.UintToAddressMap private _productDIDs;

    constructor() ERC721("Product", "PR") public {
    }

    function createProduct(address owner, address productDID) public returns (uint256) {
        _productIds.increment();
        uint256 newProductId = _productIds.current();
        _mint(owner, newProductId);
        _productDIDs.set(newProductId, productDID);
        return newProductId;
    }

    function getProductIdentityFromID(uint256 productId) public view returns (address){
        require(_exists(productId), "Product: operator query for nonexistent product");
        return _productDIDs.get(productId);
    }
}