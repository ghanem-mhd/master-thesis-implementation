import React from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  StampCard
} from "tabler-react";


class MachineMetrics extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        metrics: {
          tasksCount:0,
          issuesCount:0,
          readingsCount:0,
          maintenanceOperationsCount:0,
        },
      }
    }

    componentDidMount(){
      this.getMetrics(this.props.machine)
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if (this.props.machine !== nextProps.machine){
          this.getMetrics(nextProps.machine);
        }
    }

    getMetrics(machine){
      var MachineContract   = this.props.contracts[machine]

      MachineContract.methods["getTasksCount"]().call().then( result => {
          this.setState( (state, props) => {
              var metrics = this.state.metrics;
              metrics.tasksCount = result;
              return {
                  metrics: metrics
              };
          });
      }).catch( error => {
          console.log(error);
      });

      MachineContract.methods["getReadingsCount"]().call().then( result => {
        this.setState( (state, props) => {
            var metrics = this.state.metrics;
            metrics.readingsCount = result;
            return {
                metrics: metrics
            };
        });
      }).catch( error => {
          console.log(error);
      });

      MachineContract.methods["getIssuesCount"]().call().then( result => {
        this.setState( (state, props) => {
            var metrics = this.state.metrics;
            metrics.issuesCount = result;
            return {
                metrics: metrics
            };
        });
      }).catch( error => {
          console.log(error);
      });

      MachineContract.methods["getMaintenanceOperationsCount"]().call().then( result => {
        this.setState( (state, props) => {
            var metrics = this.state.metrics;
            metrics.maintenanceOperationsCount = result;
            return {
                metrics: metrics
            };
        });
      }).catch( error => {
          console.log(error);
      });
    }

    render() {
      return (
        <Grid.Row cards={true}>
            <Grid.Col sm={6} lg={3}>
              <StampCard color="blue" icon="list">
                <Link to={"/" + this.props.machine + "/tasks"}>{this.state.metrics.tasksCount}  Tasks</Link>
              </StampCard>
            </Grid.Col>
            <Grid.Col sm={6} lg={3}>
              <StampCard color="green" icon="radio">
                <Link to={"/" + this.props.machine + "/readings"}>{this.state.metrics.readingsCount}  Readings</Link>
              </StampCard>
            </Grid.Col>
            <Grid.Col sm={6} lg={3}>
              <StampCard color="red" icon="alert-circle">
                {this.state.metrics.issuesCount} Alerts
              </StampCard>
            </Grid.Col>
            <Grid.Col sm={6} lg={3}>
              <StampCard color="yellow" icon="alert-circle">
                {this.state.metrics.maintenanceOperationsCount} M. Operations
              </StampCard>
            </Grid.Col>
        </Grid.Row>
      )
    }
}

export default MachineMetrics;