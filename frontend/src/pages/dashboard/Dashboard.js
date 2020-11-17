// @flow

import * as React from "react";

import ProcessStepper from "../process/ProcessStepper";
import { Page, Grid, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import EventsLogStreamTable from "../log/EventsLogStreamTable";
import ConnectionContext from "../utilities/ConnectionContext";
import MachineState from "../machine/MachineState";
import ContractsLoader from "../utilities/ContractsLoader";
import ErrorPage from "../utilities/ErrorPage";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machines: [],
      processes: [],
      loading: true,
    };
  }

  componentDidMount() {
    document.title = "Dashboard";
    this.getMachinesList();
    this.getProcessList();
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
              let machine = {};
              machine.name = machineContractInfo[0];
              machine.machineContractAddress = machineContractInfo[1];
              this.setState((state, props) => {
                return {
                  loading: false,
                  machines: [...this.state.machines, machine],
                };
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
              let process = {};
              process.name = processContractInfo[0];
              process.processContractAddress = processContractInfo[1];
              this.setState((state, props) => {
                return {
                  loading: false,
                  processes: [...this.state.processes, process],
                };
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

  render() {
    if (this.state.fatalError) {
      return <ErrorPage errorMessage={this.state.fatalError} />;
    }
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.registry = connectionContext.registry;
          return (
            <Page.Content
              title="Dashboard"
              subTitle="Real time monitoring for machines and processes"
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row cards={true}>
                  {this.state.machines.map((machine, index) => (
                    <Grid.Col
                      sm={12}
                      lg={6}
                      key={machine.machineContractAddress}
                    >
                      <MachineState
                        web3={this.web3}
                        machineName={machine.name}
                        machineContractAddress={machine.machineContractAddress}
                      />
                    </Grid.Col>
                  ))}
                </Grid.Row>
                {this.state.processes.map((process, index) => (
                  <Grid.Row key={process.processContractAddress}>
                    <Grid.Col>
                      <ProcessStepper
                        registry={this.registry}
                        web3={this.web3}
                        processName={process.name}
                        processContractAddress={process.processContractAddress}
                      />
                    </Grid.Col>
                  </Grid.Row>
                ))}
                <EventsLogStreamTable title={"Events Log"} />
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default Dashboard;
