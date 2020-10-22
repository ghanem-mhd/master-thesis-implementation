import Web3 from "web3";
import VGR from './contracts/VGR.json'
import HBW from './contracts/HBW.json'
import SLD from './contracts/SLD.json'
import MPO from './contracts/MPO.json'
import Product from './contracts/Product.json'
import ProductionProcess from './contracts/ProductionProcess.json'
import SupplyingProcess from './contracts/SupplyingProcess.json'

const options = {
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545",
    },
  },
  contracts: [VGR, HBW, SLD, MPO, Product, SupplyingProcess, ProductionProcess ],
  events: {
 },
};

export default options;
