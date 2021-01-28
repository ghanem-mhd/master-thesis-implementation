import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import { Link } from "react-router-dom";
import ProductDIDResolver from "../product/ProductDIDResolver";
import ErrorPage from "../utilities/ErrorPage";
import Tooltip from "@material-ui/core/Tooltip";

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

  getTaskObject(taskID, taskResult, taskProcessInfo) {
    var task = {};
    task.ID = taskID;
    task.product = taskResult[0];
    task.name = taskResult[1];
    task.startingTime = Misc.formatTimestamp(taskResult[2]);
    task.finishingTime = Misc.formatTimestamp(taskResult[3]);
    task.status = getStatusLabel(taskResult[5].toString());
    task.note = taskResult[4];

    task.processID = taskProcessInfo[0];
    task.processContract = taskProcessInfo[1];
    task.processOwner = taskProcessInfo[2];
    return task;
  }

  async getMachineTasks(Contract) {
    try {
      let tasksCount = await Contract.methods["getTasksCount"]().call();
      this.setState({ loading: false });
      var tasks = [];
      for (let taskID = 1; taskID <= tasksCount; taskID++) {
        let taskResult = await Contract.methods["getTask"](taskID).call();
        let processInfo = await Contract.methods["getTaskProcessInfo"](
          taskID
        ).call();
        tasks.push(this.getTaskObject(taskID, taskResult, processInfo));
      }
      this.setState((state, props) => {
        return {
          tasks: tasks,
        };
      });
    } catch (error) {
      console.log(error);
    }
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
                                <Table.ColHeader alignContent="center">
                                  Task ID
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Task Name
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Task Status
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Starting Time
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Finishing Time
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Product
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Process
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Process ID
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.tasks.map((task, i) => (
                                <Table.Row key={task.ID}>
                                  <Table.Col alignContent="center">
                                    {task.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.name}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    <Tooltip
                                      title={task.note}
                                      placement="top-end"
                                    >
                                      <div>{task.status}</div>
                                    </Tooltip>
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.startingTime}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.finishingTime}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    <ProductDIDResolver
                                      productDID={task.product}
                                    />
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    <Link
                                      to={"/process/" + task.processContract}
                                    >
                                      <AddressResolver
                                        address={task.processContract}
                                      />
                                    </Link>
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {task.processID}
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

export default withRouter(MachineTasks);
