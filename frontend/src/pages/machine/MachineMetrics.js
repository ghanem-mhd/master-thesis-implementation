import React from "react";
import { newContextComponents } from "@drizzle/react-components";
import {
  Grid,
  StampCard
} from "tabler-react";

const {  ContractData } = newContextComponents;

class MachineMetrics extends React.PureComponent {

    state = {};

    render() {
        var machine = this.props.machine
        return (
         <Grid.Row deck cards={true}>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              color="blue"
              icon="list"
              header={
                <small>
                    <ContractData drizzle={this.props.drizzle}
                                drizzleState={this.props.drizzleState}
                                contract={machine}
                                method="getTasksCount"
                                methodArgs={[]}/> Tasks
                </small>
              }
            />
          </Grid.Col>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              color="green"
              icon="radio"
              header={
                <small>
                    <ContractData drizzle={this.props.drizzle}
                                drizzleState={this.props.drizzleState}
                                contract={machine}
                                method="getReadingsCount"
                                methodArgs={[]}/> Readings
                </small>
              }
            />
          </Grid.Col>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              color="red"
              icon="alert-circle"
              header={
                <small>
                    <ContractData drizzle={this.props.drizzle}
                                drizzleState={this.props.drizzleState}
                                contract={machine}
                                method="getIssuesCount"
                                methodArgs={[]}/> Alerts
                </small>
              }
            />
          </Grid.Col>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              color="yellow"
              icon="alert-circle"
              header={
                <small>
                    <ContractData drizzle={this.props.drizzle}
                                drizzleState={this.props.drizzleState}
                                contract={machine}
                                method="getMaintenanceOperationsCount"
                                methodArgs={[]}/> M. Operations
                </small>
              }
            />
          </Grid.Col>
        </Grid.Row>
        )
    }
}

export default MachineMetrics;