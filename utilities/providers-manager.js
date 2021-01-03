require("dotenv").config();

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const config = require("../truffle-config");

module.exports = {
  getWSProvider: function (networkName) {
    switch (networkName) {
      case "quorum":
        return new Web3.providers.WebsocketProvider(
          `ws://${config.networks.quorum.host}:${config.networks.quorum.wsPort}`
        );
      default:
        return new Web3.providers.WebsocketProvider(
          `ws://${config.networks[networkName].host}:${config.networks[networkName].port}`
        );
    }
  },
  getHttpProvider: function (networkName, privateKeyOrMnemonic) {
    privateKeyOrMnemonic = privateKeyOrMnemonic.replace('"', "");
    switch (networkName) {
      case "quorum":
        return new HDWalletProvider(
          privateKeyOrMnemonic,
          `http://${config.networks.quorum.host}:${config.networks.quorum.port}`
        );
      default:
        return new HDWalletProvider(
          privateKeyOrMnemonic,
          `http://${config.networks[networkName].host}:${config.networks[networkName].port}`
        );
    }
  },
};
