// @flow

import * as React from "react";
import { withRouter, Link } from "react-router-dom";
import { Page, Table, Grid, Card, Dimmer } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";

class ProcessesRegistry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
    };
  }
  getProcessesList() {
    this.registry.methods
      .getProcessesContractsCount()
      .call()
      .then((contractsCount) => {
        for (let id = 0; id < contractsCount; id++) {
          this.registry.methods
            .getProcessContract(id)
            .call()
            .then((processContract) => {
              let row = {
                processName: processContract[0],
                processContractAddress: processContract[1],
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
    document.title = "Processes Registry";
    this.getProcessesList();
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.registry = connectionContext.registry;
          return (
            <Page.Content
              title="Processes Registry"
              subTitle="List of all processes registered in the system"
            >
              <Grid.Row>
                <Grid.Col>
                  <Card>
                    <Dimmer active={false}>
                      <Card.Body>
                        {this.state.rows.length === 0 ? (
                          <div className="emptyListStatus">
                            {"No processes deployed to the registry."}
                          </div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader>Process Name</Table.ColHeader>
                                <Table.ColHeader>
                                  Process Contract Address
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.rows.map((object, i) => (
                                <Table.Row
                                  key={
                                    this.state.rows[i].processContractAddress
                                  }
                                >
                                  <Table.Col>
                                    <Link
                                      to={
                                        "/process/" +
                                        this.state.rows[i]
                                          .processContractAddress
                                      }
                                    >
                                      {this.state.rows[i].processName}
                                    </Link>
                                  </Table.Col>
                                  <Table.Col>
                                    {this.state.rows[i].processContractAddress}
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

export default withRouter(ProcessesRegistry);
