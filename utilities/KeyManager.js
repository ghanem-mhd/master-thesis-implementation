require('dotenv').config()
var ethers = require('ethers')

module.exports = {
  genereateAndSave: function(password){
    var keythereum = require("keythereum");
    var dk = keythereum.create();
    var export_options = {
        kdf: "scrypt",
        cipher: "aes-128-ctr",
        kdfparams: {
          c: 262144,
          dklen: 32,
          prf: "hmac-sha256"
        }
    };
    var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, export_options);
    keythereum.exportToFile(keyObject);
  },
  generateRandom: function(){
    return ethers.Wallet.createRandom();
  },
  generateMnemonic: function(mnemonic){
    return ethers.Wallet.fromMnemonic(mnemonic);
  },
  readFromFile: function(filePath, password){
    let json = JSON.stringify(filePath);
    return ethers.Wallet.fromEncryptedJson(json, password);
  }
}

