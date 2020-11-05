
import VGR from '../../contracts/VGR.json'
import HBW from '../../contracts/HBW.json'
import SLD from '../../contracts/SLD.json'
import MPO from '../../contracts/MPO.json'
import Product from '../../contracts/Product.json'
import ProductionProcess from '../../contracts/ProductionProcess.json'
import SupplyingProcess from '../../contracts/SupplyingProcess.json'
import EthereumDIDRegistry from '../../contracts/EthereumDIDRegistry.json'

const ContractsArtifactsList = [VGR, HBW, SLD, MPO, Product, SupplyingProcess, ProductionProcess, EthereumDIDRegistry];


const ContractsLoader = {
    load: function(web3){
        return new Promise(function (resolve, reject) {
            web3.eth.net.getId().then(networkID => {
                var contractsInstances = [];
                for (const contractArtifact of ContractsArtifactsList) {
                    var contractName    = contractArtifact.contractName;
                    if (typeof contractArtifact.networks[networkID] !== 'undefined') {
                        var contractAddress = contractArtifact.networks[networkID].address;
                        contractsInstances[contractName] = new web3.eth.Contract(contractArtifact.abi, contractAddress);
                    }else{
                        reject(`${contractName} contract is not deployed to the current network ID=${networkID}.`);
                        return;
                    }
                }
                resolve(contractsInstances);
            }).catch( error => {
                reject("Can't connected to the current network.");
            });
        });
    }
}
export default ContractsLoader;
