require("dotenv").config();

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const config = require("../truffle-config");

module.exports = {
  getWSProvider: function (networkName) {
    switch (networkName) {
      case "ganache-cli":
        return new Web3.providers.WebsocketProvider(
          `ws://${config.networks["ganache-cli"].host}:${config.networks["ganache-cli"].port}`
        );
      case "quorum":
        return new Web3.providers.WebsocketProvider(
          `ws://${config.networks.quorum.host}:${config.networks.quorum.wsPort}`
        );
    }
  },
  getHttpProvider: function (networkName, privateKeyOrMnemonic) {
    privateKeyOrMnemonic = privateKeyOrMnemonic.replace('"', "");
    switch (networkName) {
      case "ganache-cli":
        return new HDWalletProvider(
          privateKeyOrMnemonic,
          `http://${config.networks["ganache-cli"].host}:${config.networks["ganache-cli"].port}`
        );
      case "quorum":
        return new HDWalletProvider(
          privateKeyOrMnemonic,
          `http://${config.networks.quorum.host}:${config.networks.quorum.port}`
        );
    }
  },
};
