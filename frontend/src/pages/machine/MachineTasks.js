import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

function getStatusLabel(status) {
  if (status === "0") {
    return "Assigned";
  }
  if (status === "1") {
    return "Started";
  }
  if (status === "2") {
    return "Finished Successfully";
  }
  if (status === "3") {
    return "Finished unsuccessfully";
  }
  if (status === "4") {
    return "Killed";
  }
}

class MachineTasks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      loading: true,
    };
  }

  getTaskObject(TaskResult) {
    var task = {};
    task.product = TaskResult[0];
    task.name = TaskResult[1];
    task.startingTime = Misc.formatTimestamp(TaskResult[2]);
    task.finishingTime = Misc.formatTimestamp(TaskResult[3]);
    task.status = getStatusLabel(TaskResult[5].toString());
    return task;
  }

  getMachineTasks(MachineContract) {
    MachineContract.methods["getTasksCount"]()
      .call()
      .then((tasksCount) => {
        this.setState({ loading: false });
        for (let taskID = 1; taskID <= tasksCount; taskID++) {
          MachineContract.methods["getTask"](taskID)
            .call()
            .then((taskResult) => {
              let task = this.getTaskObject(taskResult);
              task.ID = taskID;
              this.setState((state, props) => {
                return {
                  tasks: [...this.state.tasks, task],
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
    document.title = "Machine Tasks";
    ContractsLoader.loadMachineContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.getMachineTasks(result.metaMaskContract);
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
      });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.match.params.address !== nextProps.match.params.address) {
      this.getMachineTasks(nextProps.match.params.machine);
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
              subTitle="A list of all tasks performed by this machine"
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row>
                  <Grid.Col>
                    <Card title="Machine Tasks" isCollapsible isFullscreenable>
                      <Card.Body>
                        {this.state.tasks.length === 0 ? (
                          <div className="emptyListStatus">{"No Tasks."}</div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader>Task ID</Table.ColHeader>
                                <Table.ColHeader>Task Name</Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Task Status
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Starting Time
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Finishing Time
                                </Table.ColHeader>
                                <Table.ColHeader>Product</Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.tasks.map((task, i) => (
                                <Table.Row key={task.ID}>
                                  <Table.Col>{task.ID}</Table.Col>
                                  <Table.Col>{task.name}</Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.status}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.startingTime}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.finishingTime}
                                  </Table.Col>
                                  <Table.Col>{task.product}</Table.Col>
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

export default withRouter(MachineTasks);
