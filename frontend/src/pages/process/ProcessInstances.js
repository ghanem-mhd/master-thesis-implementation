import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class ProcessInstances extends React.Component {
  StatusTypes = {
    0: "Started",
    1: "Finished Successfully",
    2: "Finished Unsuccessfully",
    3: "Killed",
  };

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      loading: true,
    };
  }

  getProcessInstanceObject(processInstanceResult) {
    var processInstance = {};
    processInstance.productDID = processInstanceResult[0];
    processInstance.startingTime = Misc.formatTimestamp(
      processInstanceResult[1]
    );
    processInstance.finishingTime = Misc.formatTimestamp(
      processInstanceResult[2]
    );
    processInstance.status = processInstanceResult[3];
    processInstance.currentStep = processInstanceResult[4];

    if (processInstance.currentStep === "-1") {
      processInstance.currentStep = "n.a.";
    }

    return processInstance;
  }

  getProcessInstances(ProcessContract) {
    ProcessContract.methods["getProcessesCount"]()
      .call()
      .then((instanceCount) => {
        this.setState({ loading: false });
        for (let instanceID = 1; instanceID <= instanceCount; instanceID++) {
          ProcessContract.methods["getProcessInstance"](instanceID)
            .call()
            .then((processInstanceResult) => {
              var instanceObject = this.getProcessInstanceObject(
                processInstanceResult
              );
              instanceObject.ID = instanceID;
              this.setState((state, props) => {
                return {
                  instances: [...this.state.instances, instanceObject],
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
    document.title = "Process Instances";
    ContractsLoader.loadProcessContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.getProcessInstances(result.metaMaskContract);
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
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
          return (
            <Page.Content
              title={
                <AddressResolver address={this.props.match.params.address} />
              }
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row>
                  <Grid.Col>
                    <Card>
                      <Card.Header isFullscreenable>
                        <Card.Title>Instances List</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {this.state.instances.length === 0 ? (
                          <div className="emptyListStatus">
                            {"No Instances."}
                          </div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader alignContent="center">
                                  ID
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Status
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Starting Time
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Finishing Time
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Step
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Product
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.instances.map((instance, i) => (
                                <Table.Row key={instance.ID}>
                                  <Table.Col alignContent="center">
                                    {instance.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {this.StatusTypes[instance.status]}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {instance.startingTime}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {instance.finishingTime}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {instance.currentStep}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {instance.productDID}
                                  </Table.Col>
                                </Table.Row>
                              ))}
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

export default withRouter(ProcessInstances);
