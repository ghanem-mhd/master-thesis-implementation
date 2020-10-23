import React from "react";

import {
  Table
} from "tabler-react";

class Task extends React.Component {

    state = {};

    componentDidMount(){
        var machine = this.props.machine
        var taskID  = this.props.taskID
        this.props.drizzle.contracts[machine].methods.getTask(taskID).call().then( task => {
            this.setState({task:task});
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        var machine = this.props.machine
        var taskID = this.props.taskID
        this.props.drizzle.contracts[machine].methods.getTask(taskID).call().then( newTask => {
            this.setState({task:newTask});
        });
    }


    shouldComponentUpdate(nextProps, nextState){
        if (this.state && this.state.task !== nextState.task){
            return true
        }else{
            return false
        }
    }

    render() {
        var task = this.state.task;
        if (task){
            return (
                <Table.Row key={this.props.taskID}>
                    <Table.Col>
                        {task && this.props.taskID}
                    </Table.Col>
                    <Table.Col>
                        {task && task[1]}
                    </Table.Col>
                    <Table.Col>
                        {task && new Date(task[2].toString() * 1000).toLocaleString()}
                    </Table.Col>
                    <Table.Col>
                        {task && new Date(task[3].toString() * 1000).toLocaleString()}
                    </Table.Col>
                    <Table.Col>
                        {task && task[0]}
                    </Table.Col>
                </Table.Row>
            )
        }else{
            return (<div></div>);
        }
    }
}

export default Task;