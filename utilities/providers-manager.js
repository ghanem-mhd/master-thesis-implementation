require('dotenv').config();

const Web3 = require('web3')
const HDWalletProvider = require("@truffle/hdwallet-provider");
const config = require('../truffle-config');

module.exports = {
    getWSProvider: function(networkName){
        switch(networkName) {
            case 'dev_gui':
                return new Web3.providers.WebsocketProvider(`ws://${config.networks.dev_gui.host}:${config.networks.dev_gui.port}`);
            case 'dev_cli':
                return new Web3.providers.WebsocketProvider(`ws://${config.networks.dev_cli.host}:${config.networks.dev_cli.port}`);
            case 'rinkeby':
               return null;
            }
    },
    getHttpProvider: function(networkName, privateKeyOrMnemonic){
        privateKeyOrMnemonic = privateKeyOrMnemonic.replace("\"","")
        switch(networkName) {
            case 'dev_gui':
                return new HDWalletProvider(privateKeyOrMnemonic, `http://${config.networks.dev_gui.host}:${config.networks.dev_gui.port}`);
            case 'dev_cli':
                return new HDWalletProvider(privateKeyOrMnemonic, `http://${config.networks.dev_cli.host}:${config.networks.dev_cli.port}`);
            case 'rinkeby':
               return config.networks.rinkeby.provider();
            }
    }
}