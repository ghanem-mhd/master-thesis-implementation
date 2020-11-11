import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";

class ProcessInstances extends React.Component {
  StatusTypes = {
    0: "Started",
    1: "Finished Successfully",
    2: "Finished UnSuccessfully",
    3: "Killed",
  };

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
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
    return processInstance;
  }

  getProcessInstances() {
    var ProcessContract = this.contracts[this.props.match.params.process];
    ProcessContract.methods["getProcessesCount"]()
      .call()
      .then((instanceCount) => {
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
    this.getProcessInstances();
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content
              title={this.props.match.params.process + " Instances"}
            >
              <Grid.Row>
                <Grid.Col>
                  <Card>
                    <Card.Header isFullscreenable>
                      <Card.Title>Instances List</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      {this.state.instances.length === 0 ? (
                        <div className="emptyListStatus">{"No Instances."}</div>
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
                                Current Step
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
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(ProcessInstances);
