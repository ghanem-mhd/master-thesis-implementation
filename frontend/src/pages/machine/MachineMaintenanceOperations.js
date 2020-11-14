import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class MachineMaintenanceOperations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maintenanceOperations: [],
      loading: true,
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

  getMachineMaintenanceOperations(MachineContract) {
    MachineContract.methods["getMaintenanceOperationsCount"]()
      .call()
      .then((maintenanceOperationsCount) => {
        this.setState({ loading: false });
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
                return {
                  maintenanceOperations: [
                    ...this.state.maintenanceOperations,
                    maintenanceOperation,
                  ],
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
    ContractsLoader.loadMachineContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.getMachineMaintenanceOperations(result.metaMaskContract);
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
      });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.match.params.address !== nextProps.match.params.address) {
      this.getMachineMaintenanceOperations(nextProps.match.params.address);
    }
  }

  render() {
    if (this.state.fatalError) {
      return <ErrorPage errorMessage={this.state.fatalError} />;
    }
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          return (
            <Page.Content
              title={
                <AddressResolver address={this.props.match.params.address} />
              }
              subTitle="A list of all maintenance operations performed on the machine"
            >
              <Dimmer active={this.state.loading} loader>
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
                                  Maintainer Name
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
                                      <AddressResolver
                                        address={maintenanceOperation.address}
                                      />
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
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(MachineMaintenanceOperations);
