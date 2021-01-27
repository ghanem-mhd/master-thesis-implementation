require("dotenv").config();

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const config = require("../truffle-config");

module.exports = {
  getWSProvider: function (networkName) {
    if (networkName.includes("quorum")) {
      return new Web3.providers.WebsocketProvider(
        `ws://${config.networks[networkName].host}:${config.networks[networkName].wsPort}`
      );
    } else {
      return new Web3.providers.WebsocketProvider(
        `ws://${config.networks[networkName].host}:${config.networks[networkName].port}`
      );
    }
  },
  getHttpProvider: function (networkName, privateKeyOrMnemonic) {
    privateKeyOrMnemonic = privateKeyOrMnemonic.replace('"', "");
    return new HDWalletProvider(
      privateKeyOrMnemonic,
      `http://${config.networks[networkName].host}:${config.networks[networkName].port}`
    );
  },
};
