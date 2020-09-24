import Web3 from "web3";
import VGR from './contracts/VGR.json'
import HBW from './contracts/HBW.json'
import SLD from './contracts/SLD.json'
import MPO from './contracts/MPO.json'

const options = {
  web3: {
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [VGR, HBW, SLD, MPO],
  events: {
 },
};

export default options;
