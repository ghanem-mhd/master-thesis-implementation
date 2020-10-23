require('dotenv').config()
var web3 = require('web3');

module.exports = {
  toHex: function(string){
    return web3.utils.padRight(web3.utils.asciiToHex(string), 64)
  },
  toString: function(hex){
    return web3.utils.hexToString(hex)
  },
  sendTransaction(contractMethodCall) {
    return new Promise(function (resolve, reject) {
      contractMethodCall.on('error', error => {
        reject(error);
      }).on('confirmation', (num, receipt) => {
          if (num == 2){
              resolve(receipt);
          }
      });
    });
  }
}