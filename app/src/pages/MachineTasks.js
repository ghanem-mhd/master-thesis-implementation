import React from "react";

import { newContextComponents } from "@drizzle/react-components";

import {
  Table,
  Grid,
  Card
} from "tabler-react";

import Task from "./Task";

const { ContractData } = newContextComponents;

class MachineTasks extends React.PureComponent {

    state = {};

    constructor(props){
        super(props);
    }

    componentDidUpdate(){
        var machine = this.props.machine
        this.setState({key:this.props.drizzle.contracts[machine].methods["getTasksCount"].cacheCall()});
    }

    render() {
        var machine = this.props.machine
        const contract  = this.props.drizzleState.contracts[machine];
        const tasksCount = contract.getTasksCount[this.state.key];

        if (!tasksCount){
            return (
                <div>
                </div>
            )
        }
        var tasks = []

        for (var i = 1 ; i <= tasksCount.value ; i++){
            tasks.push(

                        <Task
                            key={i}
                            drizzle={this.props.drizzle}
                            drizzleState={this.props.drizzleState}
                            machine={machine}
                            taskID={i}
                        />
            )
        }

        return (
            <Grid.Row>
                <Grid.Col md={12} xl={12}>
                    <Card
                    title="Machine Tasks"
                    isCollapsible
                    isClosable
                    body={
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColHeader>Task ID</Table.ColHeader>
                                    <Table.ColHeader>Task Name</Table.ColHeader>
                                    <Table.ColHeader>Starting Time</Table.ColHeader>
                                    <Table.ColHeader>Finishing Time</Table.ColHeader>
                                    <Table.ColHeader>Product</Table.ColHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {tasks}
                            </Table.Body>
                        </Table>
                    }
                    />
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default MachineTasks;