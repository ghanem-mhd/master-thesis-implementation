import Web3 from "web3";
import VGR from "./contracts/VGR";

const options = {
  web3: {
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [VGR],
  events: {
   VGR: ["NewTask"],
 },
};

export default options;
