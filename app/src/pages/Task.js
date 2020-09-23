import React from "react";

import {
  Table
} from "tabler-react";

class Task extends React.PureComponent {

    state = {};

    render() {
        console.log("Task")
        var machine = this.props.machine
        var taskID = this.props.taskID

        var dataKey1 = this.props.drizzle.contracts[machine].methods["getTask"].cacheCall(taskID)
        const contract  = this.props.drizzleState.contracts[machine];
        const task = contract.getTask[dataKey1];

        return (
            <Table.Row key={this.props.taskID}>
                <Table.Col>
                    {this.props.taskID}
                </Table.Col>
                <Table.Col>
                    {task && task.value[1]}
                </Table.Col>
                <Table.Col>
                    {task && new Date(task.value[2].toString() * 1000).toLocaleString()}
                </Table.Col>
                <Table.Col>
                    {task && new Date(task.value[3].toString() * 1000).toLocaleString()}
                </Table.Col>
                <Table.Col>
                    {task && task.value[0]}
                </Table.Col>
            </Table.Row>
        )
    }
}

export default Task;