var ethers = require('ethers')

let httpProvider = new ethers.providers.JsonRpcProvider();

let address = "0x0000000000000000000000000000000000000000";
const GameItem = require('./build/contracts/GameItem.json')

//console.log(GameItem.abi)

let contractAddress = "0x16c4B55b0176CDA1893963c631C252a3645E11E6";

let contract = new ethers.Contract(contractAddress, GameItem.abi, httpProvider);

async function test(){

    let currentValue = await contract.balanceOf("0x1404D0AD808a15de0B6fdFadD3f0BEEa0aDBfe03");

    console.log(currentValue);
}

async function test2(){
    console.log(contract.filters)
    let filter = contract.filters.Transfer(null, "0x1404D0AD808a15de0B6fdFadD3f0BEEa0aDBfe03");

    // Listen for our filtered results
    contract.on(filter, (from, to, value) => {
        console.log('I received ' + value.toString() + ' tokens from ' + from);
    });
}

let password = "test";

var data = require('../keystore/m1.json')

var keyManager = require('./KeyManager')

keyManager.readFromFile(data,password).then(function(wallet) {
    console.log(wallet)
    console.log("Address: " + wallet.address);
    // "Address: 0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290"
});