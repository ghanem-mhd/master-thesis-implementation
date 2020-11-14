import Product from "../../contracts/Product.json";
import EthereumDIDRegistry from "../../contracts/EthereumDIDRegistry.json";
import Registry from "../../contracts/Registry.json";
import Machine from "../../contracts/Machine.json";
import ProductionProcess from "../../contracts/ProductionProcess.json";
import SupplyingProcess from "../../contracts/SupplyingProcess.json";
import Web3 from "web3";

const ContractsArtifactsList = [
  Product,
  EthereumDIDRegistry,
  Registry,
  ProductionProcess,
  SupplyingProcess,
];

const ContractsLoader = {
  load: function (web3) {
    return new Promise(function (resolve, reject) {
      var wsProvider = new Web3(process.env.REACT_APP_WS_NETWORK);
      web3.eth.net
        .getId()
        .then((networkID) => {
          var contractsInstances = {};
          contractsInstances.metamaskProvider = [];
          contractsInstances.wsProvider = [];
          for (const contractArtifact of ContractsArtifactsList) {
            var contractName = contractArtifact.contractName;
            if (typeof contractArtifact.networks[networkID] !== "undefined") {
              var contractAddress =
                contractArtifact.networks[networkID].address;

              contractsInstances.wsProvider[
                contractName
              ] = new wsProvider.eth.Contract(
                contractArtifact.abi,
                contractAddress
              );

              contractsInstances.metamaskProvider[
                contractName
              ] = new web3.eth.Contract(contractArtifact.abi, contractAddress);
            } else {
              reject(
                `${contractName} contract is not deployed to the current network ID=${networkID}.`
              );
              return;
            }
          }
          resolve(contractsInstances);
        })
        .catch((error) => {
          reject("Can't connected to the current network.");
        });
    });
  },
  loadMachineContract(web3, contractAddress) {
    return new Promise(function (resolve, reject) {
      var wsProvider = new Web3(process.env.REACT_APP_WS_NETWORK);
      web3.eth.net
        .getId()
        .then((networkID) => {
          var machineContract = {};

          machineContract.wsContract = new wsProvider.eth.Contract(
            Machine.abi,
            contractAddress
          );

          machineContract.metaMaskContract = new web3.eth.Contract(
            Machine.abi,
            contractAddress
          );

          resolve(machineContract);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
export default ContractsLoader;
