require("dotenv").config();

module.exports = {
  networks: {
    dev: {
      host: "127.0.0.1",
      port: 23000,
      network_id: "*",
    },
    "ganache-cli": {
      host: "node1",
      port: 8545,
      network_id: "*",
    },
    quorum: {
      host: "node1",
      port: 8545,
      wsPort: 8546,
      network_id: "*",
      type: "quorum",
      gasPrice: 0,
    },
  },
  compilers: {
    solc: {
      version: "0.6.10",
    },
  },
  plugins: ["truffle-contract-size"],
};
