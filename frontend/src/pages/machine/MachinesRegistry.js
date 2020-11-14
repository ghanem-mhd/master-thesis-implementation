// @flow

import * as React from "react";
import { withRouter, Link } from "react-router-dom";
import { Page, Table, Grid, Card, Dimmer } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";

class MachinesRegistry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
    };
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
            .then((machineContract) => {
              let row = {
                machineName: machineContract[0],
                machineContractAddress: machineContract[1],
              };
              this.setState((state, props) => {
                return {
                  rows: [...this.state.rows, row],
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

  componentDidMount() {
    document.title = "Machines Registry";
    this.getMachinesList();
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.registry = connectionContext.registry;
          return (
            <Page.Content
              title="Machines Registry"
              subTitle="List of all machines registered in the system"
            >
              <Grid.Row>
                <Grid.Col>
                  <Card>
                    <Dimmer active={false}>
                      <Card.Body>
                        {this.state.rows.length === 0 ? (
                          <div className="emptyListStatus">
                            {"No machines deployed to the registry."}
                          </div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader>Machine Name</Table.ColHeader>
                                <Table.ColHeader>
                                  Machine Contract Address
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.rows.map((object, i) => (
                                <Table.Row
                                  key={
                                    this.state.rows[i].machineContractAddress
                                  }
                                >
                                  <Table.Col>
                                    <Link
                                      to={
                                        "/machine/" +
                                        this.state.rows[i]
                                          .machineContractAddress
                                      }
                                    >
                                      {this.state.rows[i].machineName}
                                    </Link>
                                  </Table.Col>
                                  <Table.Col>
                                    {this.state.rows[i].machineContractAddress}
                                  </Table.Col>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table>
                        )}
                      </Card.Body>
                    </Dimmer>
                  </Card>
                </Grid.Col>
              </Grid.Row>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(MachinesRegistry);
