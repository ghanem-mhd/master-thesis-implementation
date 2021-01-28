// @flow

import * as React from "react";

import { Grid, Card } from "tabler-react";
import ConnectionContext from "../utilities/ConnectionContext";
import EventsTable from "./EventsTable";
import ContractsLoader from "../utilities/ContractsLoader";

class EventsLogStreamTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
    };
  }

  componentDidMount() {
    this.getMachinesList();
    this.getProcessList();
  }

  setMachineListeners(machineContract) {
    machineContract.methods
      .getName()
      .call()
      .then((machineName) => {
        machineContract.events.TaskAssigned(
          { fromBlock: "latest" },
          (error, event) => {
            if (error) {
              console.log(error);
            } else {
              this.onNewEvent(machineName, event);
            }
          }
        );
        machineContract.events.TaskStarted(
          { fromBlock: "latest" },
          (error, event) => {
            if (error) {
              console.log(error);
            } else {
              this.onNewEvent(machineName, event);
            }
          }
        );
        machineContract.events.TaskFinished(
          { fromBlock: "latest" },
          (error, event) => {
            if (error) {
              console.log(error);
            } else {
              this.onNewEvent(machineName, event);
            }
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setProcessListeners(processContract) {
    processContract.methods
      .getName()
      .call()
      .then((processName) => {
        processContract.events.ProcessStarted(
          { fromBlock: "latest" },
          (error, event) => {
            if (error) {
              console.log(error);
            } else {
              this.onNewEvent(processName, event);
            }
          }
        );
        processContract.events.ProcessStepStarted(
          { fromBlock: "latest" },
          (error, event) => {
            if (error) {
              console.log(error);
            } else {
              this.onNewEvent(processName, event);
            }
          }
        );
        processContract.events.ProcessFinished(
          { fromBlock: "latest" },
          (error, event) => {
            if (error) {
              console.log(error);
            } else {
              this.onNewEvent(processName, event);
            }
          }
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getMachinesList() {
    try {
      let contractsCount = await this.registry.methods
        .getMachineContractsCount()
        .call();
      for (let id = 0; id < contractsCount; id++) {
        let machineContractInfo = await this.registry.methods
          .getMachineContract(id)
          .call();
        let result = await ContractsLoader.loadMachineContract(
          this.web3,
          machineContractInfo[1]
        );
        this.setMachineListeners(result.wsContract);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getProcessList() {
    try {
      let contractsCount = await this.registry.methods
        .getProcessesContractsCount()
        .call();
      for (let id = 0; id < contractsCount; id++) {
        let processContractInfo = await this.registry.methods
          .getProcessContract(id)
          .call();
        let result = await ContractsLoader.loadProcessContract(
          this.web3,
          processContractInfo[1]
        );
        this.setProcessListeners(result.wsContract);
      }
    } catch (error) {
      console.log(error);
    }
  }

  onNewEvent(contractName, ethereumEvent) {
    let row = {
      contractName: contractName,
      _id: ethereumEvent.transactionHash + ethereumEvent.id,
      payload: ethereumEvent,
      eventName: ethereumEvent.event,
      blockNumber: ethereumEvent.blockNumber,
      transactionHash: ethereumEvent.transactionHash,
    };
    this.setState((state, props) => {
      return {
        rows: [...this.state.rows, row],
      };
    });
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.registry = connectionContext.registry;
          this.web3 = connectionContext.web3;
          return (
            <Grid.Row>
              <Grid.Col>
                <Card
                  title={this.props.title}
                  isFullscreenable
                  isClosable
                  isCollapsible
                  footer="Events emitted by machines and processes smart contracts"
                >
                  <EventsTable
                    rows={this.state.rows}
                    emptyStateMessage={"Listening for new events..."}
                  />
                </Card>
              </Grid.Col>
            </Grid.Row>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default EventsLogStreamTable;
