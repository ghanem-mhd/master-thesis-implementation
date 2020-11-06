import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";

class MachineMaintenanceOperations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maintenanceOperations: [],
    };
  }

  getMaintenanceOperationObject(MaintenanceOperationResult) {
    var maintenanceOperation = {};
    maintenanceOperation.time = Misc.formatTimestamp(
      MaintenanceOperationResult[0]
    );
    maintenanceOperation.address = MaintenanceOperationResult[1];
    maintenanceOperation.description = MaintenanceOperationResult[2];
    return maintenanceOperation;
  }

  getMachineMaintenanceOperations(machine) {
    var MachineContract = this.contracts[machine];
    MachineContract.methods["getMaintenanceOperationsCount"]()
      .call()
      .then((maintenanceOperationsCount) => {
        for (
          let maintenanceOperationID = 1;
          maintenanceOperationID <= maintenanceOperationsCount;
          maintenanceOperationID++
        ) {
          MachineContract.methods["getMaintenanceOperation"](
            maintenanceOperationID
          )
            .call()
            .then((maintenanceOperationResult) => {
              var maintenanceOperation = this.getMaintenanceOperationObject(
                maintenanceOperationResult
              );
              maintenanceOperation.ID = maintenanceOperationID;
              this.setState((state, props) => {
                var maintenanceOperations = this.state.maintenanceOperations;
                maintenanceOperations.push(maintenanceOperation);
                return {
                  maintenanceOperations: maintenanceOperations,
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
    document.title = "Machine Maintenance Operations";
    this.getMachineMaintenanceOperations(this.props.match.params.machine);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.match.params.machine !== nextProps.match.params.machine) {
      this.getMachineMaintenanceOperations(nextProps.match.params.machine);
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content
              title={this.props.match.params.machine + " Machine Digital Twin"}
            >
              <Grid.Row>
                <Grid.Col>
                  <Card
                    title="Machine Maintenance Operations"
                    isCollapsible
                    isFullscreenable
                  >
                    <Card.Body>
                      {this.state.maintenanceOperations.length === 0 ? (
                        <div className="emptyListStatus">
                          {"No Maintenance Operations."}
                        </div>
                      ) : (
                        <Table>
                          <Table.Header>
                            <Table.Row>
                              <Table.ColHeader alignContent="center">
                                ID
                              </Table.ColHeader>
                              <Table.ColHeader alignContent="left">
                                Maintainer Address
                              </Table.ColHeader>
                              <Table.ColHeader alignContent="left">
                                Description
                              </Table.ColHeader>
                              <Table.ColHeader alignContent="left">
                                Time
                              </Table.ColHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {this.state.maintenanceOperations.map(
                              (maintenanceOperation, i) => (
                                <Table.Row key={maintenanceOperation.ID}>
                                  <Table.Col alignContent="center">
                                    {maintenanceOperation.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="left">
                                    {maintenanceOperation.address}
                                  </Table.Col>
                                  <Table.Col alignContent="left">
                                    {maintenanceOperation.description}
                                  </Table.Col>
                                  <Table.Col alignContent="left">
                                    {maintenanceOperation.time}
                                  </Table.Col>
                                </Table.Row>
                              )
                            )}
                          </Table.Body>
                        </Table>
                      )}
                    </Card.Body>
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

export default withRouter(MachineMaintenanceOperations);
