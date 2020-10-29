import React from "react";

import { withRouter } from "react-router";

import {
  Table,
  Grid,
  Card,
  Page
} from "tabler-react";
import Misc from '../utilities/Misc';
import ConnectionContext from '../utilities/ConnectionContext';

class MachineTasks extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        tasks: []
      }
    }

    getTaskObject(TaskResult){
        var task            = {};
        task.product        = TaskResult[0];
        task.name           = TaskResult[1];
        task.startingTime   = Misc.formatTimestamp(TaskResult[2]);
        task.finishingTime  = Misc.formatTimestamp(TaskResult[3]);
        return task;
    }

    getMachineTasks(machine){
        var MachineContract   = this.contracts[machine];
        MachineContract.methods["getTasksCount"]().call().then( tasksCount => {
            for (let taskID = 1; taskID <= tasksCount; taskID++) {
                MachineContract.methods["getTask"](taskID).call().then( taskResult => {
                    var task = this.getTaskObject(taskResult);
                    task.ID = taskID;
                    this.setState( (state, props) => {
                        var tasks = this.state.tasks;
                        tasks.push(task);
                        return {
                            tasks: tasks
                        };
                    });
                }).catch( error => {
                    console.log(error);
                });
            }
        }).catch( error => {
            console.log(error);
        });
    }

    componentDidMount(){
        this.getMachineTasks(this.props.match.params.machine)
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if (this.props.match.params.machine !== nextProps.match.params.machine){
            this.getMachineTasks(nextProps.match.params.machine);
        }
    }

    render() {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                this.web3       = connectionContext.web3;
                this.contracts  = connectionContext.contracts;
                return (
                    <Page.Content title={this.props.match.params.machine + " Machine Digital Twin"}>
                        <Grid.Row>
                            <Grid.Col>
                                <Card title="Machine Tasks" isCollapsible isFullscreenable>
                                    <Card.Body>
                                        <Table>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.ColHeader>Task ID</Table.ColHeader>
                                                    <Table.ColHeader>Task Name</Table.ColHeader>
                                                    <Table.ColHeader alignContent="center">Starting Time</Table.ColHeader>
                                                    <Table.ColHeader alignContent="center">Finishing Time</Table.ColHeader>
                                                    <Table.ColHeader>Product</Table.ColHeader>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                            {
                                                this.state.tasks.map((task, i) =>
                                                    <Table.Row key={task.ID}>
                                                        <Table.Col>{task.ID}</Table.Col>
                                                        <Table.Col>{task.name}</Table.Col>
                                                        <Table.Col alignContent="center">{task.startingTime}</Table.Col>
                                                        <Table.Col alignContent="center">{task.finishingTime}</Table.Col>
                                                        <Table.Col>{task.product}</Table.Col>
                                                    </Table.Row>
                                                )
                                            }
                                            </Table.Body>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Grid.Col>
                        </Grid.Row>
                    </Page.Content>
                    )
                }}
            </ConnectionContext.Consumer>
        )
    }
}

export default withRouter(MachineTasks);