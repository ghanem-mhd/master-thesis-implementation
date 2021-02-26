# Master Thesis Implementation

This repository contains the prototype implementation for a [mater thesis](https://github.com/ghanem-mhd/master-thesis) in the domain of blockchain and industry 4.0. The thesis title is "A Blockchain-Based Concept and Implementation for Machine Identity and Machine-to-Machine Communication."

The prototype demonstrates how blockchain can be used to build machine-to-machine communication for the manufacturing industry. The prototype uses the [Fischertechnik Factory Model](https://github.com/ghanem-mhd/fischertechnik-factory-simulation) as a hardware simulation of the machines.


## Prototype
This video demonstrates how the prototype is working in an exemplary use case.
<p align="center">
  <a href="https://www.youtube.com/watch?v=_VNuOGsH1bk">
    <img src="https://img.youtube.com/vi/_VNuOGsH1bk/0.jpg?raw=true" alt="Prototype">
  </a>
</p>

Screenshots from the web application are available in this [folder](/screenshots).

## Architecture

<p align="center">
  <a href="https://github.com/ghanem-mhd/master-thesis/blob/master/figures/architecture2.png">
    <img src="https://github.com/ghanem-mhd/master-thesis/blob/master/figures/architecture2.png?raw=true" alt="architecture">
  </a>
</p>

The Fischertechnik component includes the four machines mentioned in the last section. Each machine runs on a different controller, and all are connected to the MQTT broker. In the gateway, there are four machine client programs; each one corresponds to one physical machine. The machine client program is responsible for synchronizing the physical machine with its digital twin. Also, the gateway includes two processes client one for each process. The process client is responsible for executing the process steps one by one by monitoring the machine's status. In the blockchain, all the systems contracts are deployed and running. For each machine, there is a machine contract that represents the digital twin of the machine. For each process, there is a process contract that manages the process execution inside the blockchain. In addition to the machines and process contracts, The product's smart contract includes information about product digital twins.

The Fischertechnik and the gateway communicate with each other by sending MQTT messages. The gateway clients send transactions to smart contracts and listen to events. The Web application also sends transactions to the smart contract and uses read-only functions to display the smart contracts' information. There are contract-to-contract functions calls between the blockchain contracts, but for simplicity, they have been omitted.

## Development Tools and Frameworks

### Blockchain and Smart Contracts

In this section, we present the tools used in the development and implementation of smart contracts.

- **Truffle:** A smart contract development framework. It is part of the truffle suit, a set of tools built to make the development of DApps easier. The framework allows compiling, debugging, deployment, and testing Solidity smart contracts in Ethereum networks. The framework uses its contract abstraction to felicitate interacting with the smart contract from Javascript.

- **Ganache:** Another tool from the truffle suit provides a lightweight blockchain for development and test use. Ganache has two versions, one with GUI and the other as command-line tool CLI. We used ganache CLI for testing as it provides a fast, clean instance of the Ethereum network.

- **Quorum Blockchain:** Quorum is a permissioned version of Ethereum, focused on enterprise use. It has several advantages over public Ethereum like privacy, high performance, and support multiple consensus algorithms.

- **OpenZeppelin:** Like the truffle suite, OpenZeppelin provides security products to build, automate, and operate decentralized applications. The main product of OpenZeppelin is OpenZeppelin Contracts, which provides standard smart contract implementation and Solidity components to be used as a library while building custom contracts. We used OpenZeppelin Contracts utility components in our contracts. We also used the OpenZeppelin Test Environment as the testing environment for all the contracts.

- **Web3.js:** The Ethereum JavaScript API. It implements the generic JSON-RPC protocol to connect and interact with any Ethereum network. We used this library in the gateway in all clients to sign transactions and interact with the deployed smart contracts.

### Gateway and Web Application

This section presents the tools used in the development and implementation of the gateway and web application.

- **NodeJS**: An open-source, JavaScript runtime environment that executes JavaScript code outside a web browser. All gateway clients run inside one NodeJs server.

- **ReactJS:** A JavaScript library for building user interfaces.

- **Tabler-React:** A open-source frontend template.

- **MetaMask:** A browser extension to interact with any Ethereum network. It handles account management and connecting the user to the blockchain. With this extension, the web application users can manage their accounts and keys and send/sign transactions.

## Project Structure

- Server.js: NodeJS with express framework represents the gateway.

- MQTT: JS scripts run by the server to handle the communication between the gateway and other system compounds.

- blockchain: Docker files for running local blockchain networks.

- contracts: Smart contract of the system written in Solidity.

- ethr-did-registry: Ethereum registry (ERC-1056) implementation for [ethr DID method](https://github.com/uport-project/ethr-did-registry).

- frontend: Frontend React application.

- migrations: Scripts for deploying the smart contracts into the blockchain.

- scripts: JS and bash scripts for starting, stopping, and seeding.

- test: Unit test for smart contracts code.

- utilities: JS utility scripts used inside the gateway both by the server and MQTT scripts.

## Project Setup

There are two methods to set up and run the project, either by running the pre-configured docker containers or running locally. All the project configurations and environment variables are defined in the [.env](./.env) file.

| Environment Variable |                 Description                 |          Values          |
| :------------------: | :-----------------------------------------: | :----------------------: |
|       NETWORK        |           Blockchain network type           |   ganache-cli, quorum    |
|     MQTT_BROKER      |          MQTT broker host and port          | mqtt://xxx.xx.xx.xx:xxxx |
| DEPLOY_NEW_INSTANCE  | Deploy new instances of the smart contracts |       false, true        |
|    BUILD_FRONTEND    |       Build the frontend application        |       false, true        |

The .env file contains other variables and public/private key pairs used in the gateway.

### Setup with Docker

Each compound of the project is wrapped with a docker container defined by the following [docker-compose](https://docs.docker.com/compose/) files.

#### [Docker-compose.yaml](./docker-compose.yaml)

This compose file define the following containers:

- Gateway container: runs the NodeJS server. The image for this container is defined [here](./Dockerfile). The root directory is mounted as a volume, which means there is no need to build the image if there is a change in the code. The image execute the [run.sh](./scripts/run.sh) every time it started.
- Broker container: runs an MQTT broker container from the [eclipse-mosquitto](https://hub.docker.com/_/eclipse-mosquitto) docker image. This broker is used only while development to replace the broker provided by the Fischertechnik factory.

#### [Blockchain/\*/docker-compose.yaml](./blockchain/)

Two blockchain networks can be used. To choose the blockchain network, modify the environment variable NETWORK in the [.env](./.env) file to one of the values (ganache-cli or quorum).

- [Ganache-CLI](https://github.com/trufflesuite/ganache-cli) defined in the [blockchain/ganache-cli/docker-compose.yaml].
- [Quorum](https://github.com/ConsenSys/quorum) defined in the [blockchain/quorum](blockchain/quorum). It is a two-node network generated using the [quorum-wizard](https://github.com/ConsenSys/quorum-wizard). It uses the Istanbul consensus algorithm.

#### Running Containers

Bash scripts are provided to [start.sh](scripts/start.sh) and [stop.sh](scripts/stop.sh) the containers. Before executing the scripts, make sure the environment variables are set properly, as explained in the table above.

#### Starting Containers

The [start.sh](scripts/start.sh) script starts the blockchain container in the background depending on the value of the environment variable NETWORK. Then it starts the gateway and broker containers in the foreground. The gateway container executes the [run.sh](./scripts/run.sh) script, which first checks if a new instance of the contracts should be deployed, and then it checks if the frontend application should be built. In case you do not want to build the frontend application, you can use the development server of the react application after installing the frontend dependencies.

```sh
cd frontend
yarn install
# or
npm install
npm run start
```

#### Stopping Containers

As the gateway and broker containers are running in the foreground, pressing Ctrl+C will stop them. However, to stop the blockchain containers running in the background, the [stop.sh](scripts/stop.sh) can be used. This script also deletes all the containers, volumes, and networks created previously, which means all the data stored in the blockchain is erased. The next time the containers are started again, the DEPLOY_NEW_INSTANCE should be set to true; otherwise, the gateway will not run properly.

## Running the tests

The tests provided in the project are for smart contracts. They are executed in [OpenZeppelin Test Environment](https://github.com/OpenZeppelin/openzeppelin-test-environment).

```sh
npm run test
```

## Contact

- ghanem.mhd95@gmail.com
- mohammad.ghanem@rwth-aachen.de
