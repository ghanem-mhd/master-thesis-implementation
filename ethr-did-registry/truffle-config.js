var truffleGlobalConfig = require('../truffle-config.js')

module.exports = {
  networks: truffleGlobalConfig.networks,
  compilers: {
    solc: {
      version: "0.4.21",

    }
  }
};
