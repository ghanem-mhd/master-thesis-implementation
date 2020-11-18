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

  getMachinesList() {
    this.registry.methods
      .getMachineContractsCount()
      .call()
      .then((contractsCount) => {
        for (let id = 0; id < contractsCount; id++) {
          this.registry.methods
            .getMachineContract(id)
            .call()
            .then((machineContractInfo) => {
              ContractsLoader.loadMachineContract(
                this.web3,
                machineContractInfo[1]
              )
                .then((result) => {
                  this.setMachineListeners(result.wsContract);
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getProcessList() {
    this.registry.methods
      .getProcessesContractsCount()
      .call()
      .then((contractsCount) => {
        for (let id = 0; id < contractsCount; id++) {
          this.registry.methods
            .getProcessContract(id)
            .call()
            .then((processContractInfo) => {
              ContractsLoader.loadProcessContract(
                this.web3,
                processContractInfo[1]
              )
                .then((result) => {
                  this.setProcessListeners(result.wsContract);
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onNewEvent(contractName, ethereumEvent) {
    let row = {
      contractName: contractName,
      _id: ethereumEvent.transactionHash,
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
                <Card title={this.props.title} isCollapsible isFullscreenable>
                  <EventsTable rows={this.state.rows} />
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
