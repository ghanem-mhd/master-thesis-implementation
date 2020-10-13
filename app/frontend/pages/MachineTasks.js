import React from "react";

import { newContextComponents } from "@drizzle/react-components";
import SiteWrapper from "./SiteWrapper.react";
import { withRouter } from "react-router";

import {
  Table,
  Grid,
  Card,
  Page
} from "tabler-react";

import Task from "./Task";

const { ContractData } = newContextComponents;

class MachineTasks extends React.Component {

    state = {};

    constructor(props){
        super(props);
    }

    getData(props){
        var machine = props.match.params.machine
        props.drizzle.contracts[machine].methods["getTasksCount"].call().call().then( result => {
            this.setState({tasksCount:result})
        });
    }

    componentDidMount(){
        this.getData(this.props)
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        this.getData(nextProps)
    }

    render() {
        var machine = this.props.match.params.machine
        var tasksCount = this.state.tasksCount;
        if (tasksCount){
            return (
                <SiteWrapper>
                    <Page.Content title={machine + " Digital Twin"}>
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
                                            {
                                                [...Array(parseInt(tasksCount)+1).keys()].slice(1).map((x, i) =>
                                                            <Task
                                                                key={x}
                                                                drizzle={this.props.drizzle}
                                                                drizzleState={this.props.drizzleState}
                                                                machine={machine}
                                                                taskID={x}
                                                        />)
                                            }
                                            </Table.Body>
                                        </Table>
                                    }
                                />
                            </Grid.Col>
                        </Grid.Row>
                    </Page.Content>
                </SiteWrapper>
            )
        }else{
            return (<div>Loading</div>);
        }
    }
}

export default withRouter(MachineTasks);