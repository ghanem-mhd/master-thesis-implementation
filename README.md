# Master Thesis Implementation

This repository contains the prototype implementation for a [mater thesis](https://github.com/ghanem-mhd/master-thesis) in the domain of blockchain and industry 4.0. The thesis title is "A Blockchain-Based Concept and Implementation for Machine Identity and Machine-to-Machine Communication".

The prototype demonstrates how blockchain can be used to build machine-to-machine communication for the manufacturing industry. The prototype uses the [Fischertechnik Factory Model](https://github.com/ghanem-mhd/fischertechnik-factory-simulation) as a hardware simulation of the machines.

## Architecture

<p align="center">
  <a href="https://github.com/ghanem-mhd/master-thesis/blob/master/figures/architecture2.png">
    <img src="https://github.com/ghanem-mhd/master-thesis/blob/master/figures/architecture2.png?raw=true" alt="architecture">
  </a>
</p>

The Fischertechnik component includes the four machines mentioned in the last section. Each machine runs on a different controller, and all connected to the MQTT broker. In the gateway, there are four machine client programs; each one corresponds to one physical machine. The machine client program is responsible for synchronizing the physical machine with its digital twin. Also, the gateway includes two processes client one for each process. The process client is responsible for executing the process steps one by one by monitoring the machine's status. In the blockchain, all the systems contracts are deployed and running. For each machine, there is a machine contract that represents the digital twin of the machine. For each process, there is a process contract that manages the process execution inside the blockchain. In addition to the machines and process contracts, The product's smart contract includes information about product digital twins.

The Fischertechnik and the gateway communicate with each other by sending MQTT messages. The gateway clients send transactions to smart contracts and listen to events. The Web application also sends transactions to the smart contract and uses read-only functions to display the smart contracts' information. There are contract-to-contract functions calls between the blockchain contracts, but for simplicity, they have been omitted.

## Development Tools and Framework

### Blockchain and Smart Contracts

In this section, we present the tools used in the development and implementation of smart contracts.

- **Truffle:** A smart contract development framework . It is part of the truffle suit, a set of tools built to make the development of DApps easier. The framework allows compiling, debugging, deployment, and testing Solidity smart contracts in Ethereum networks. The framework uses its contract abstraction to felicitate interacting with the smart contract from Javascript.

- **Ganache:** Another tool from the truffle suit provides a lightweight blockchain for development, and test use . Ganache has two versions, one with GUI and the other as command-line tool CLI. We used ganache CLI for testing as it provides a fast, clean instance of the Ethereum network.

- **Quorum Blockchain:** Quorum is a permissioned version of Ethereum, focused on enterprise use . It has several advantages over public Ethereum like privacy, high performance, and support multiple consensus algorithms.

- **OpenZeppelin:** Like the truffle suite, OpenZeppelin provides security products to build, automate, and operate decentralized applications . The main product of OpenZeppelin is OpenZeppelin Contracts, which provides standard smart contract implementation and Solidity components to be used as a library while building custom contracts. We used OpenZeppelin Contracts utility components in our contracts. We also used the OpenZeppelin Test Environment as the testing environment for all the contracts.

- **Web3.js:** The Ethereum JavaScript API . It implements the generic JSON-RPC protocol to connect and interact with any Ethereum network. We used this library in the gateway in all clients to sign transactions and interact with the deployed smart contracts.

### Gateway and Web Application

This section presents the tools used in the development and implementation of the gateway and web application.

- **NodeJS**: An open-source, JavaScript runtime environment that executes JavaScript code outside a web browser . All gateway clients run inside one NodeJs server.

- **ReactJS:** A JavaScript library for building user interfaces.

- **Tabler-React:** A open source frontend template.

- **MetaMask:** A browser extension to interact with any Ethereum network . It handles account management and connecting the user to the blockchain. With this extension, the web application users can manage their accounts and keys and send/sign transactions.

## Project Structure
