import React from "react";
import { Link } from "react-router-dom";
import { Grid, StampCard } from "tabler-react";

class MachineMetrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metrics: {
        tasksCount: 0,
        alertsCount: 0,
        readingsCount: 0,
        maintenanceOperationsCount: 0,
      },
    };
  }

  componentDidMount() {
    this.getMetrics();
  }

  getMetrics() {
    this.props.MachineContract.methods["getTasksCount"]()
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var metrics = this.state.metrics;
          metrics.tasksCount = result;
          return {
            metrics: metrics,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.props.MachineContract.methods["getReadingsCount"]()
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var metrics = this.state.metrics;
          metrics.readingsCount = result;
          return {
            metrics: metrics,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.props.MachineContract.methods["getAlertsCount"]()
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var metrics = this.state.metrics;
          metrics.alertsCount = result;
          return {
            metrics: metrics,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.props.MachineContract.methods["getMaintenanceOperationsCount"]()
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var metrics = this.state.metrics;
          metrics.maintenanceOperationsCount = result;
          return {
            metrics: metrics,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <Grid.Row cards={true}>
        <Grid.Col sm={6} lg={3}>
          <StampCard color="blue" icon="list">
            <Link
              to={"/machine/" + this.props.MachineContract._address + "/tasks"}
            >
              {this.state.metrics.tasksCount} Tasks
            </Link>
          </StampCard>
        </Grid.Col>
        <Grid.Col sm={6} lg={3}>
          <StampCard color="green" icon="radio">
            <Link
              to={
                "/machine/" + this.props.MachineContract._address + "/readings"
              }
            >
              {this.state.metrics.readingsCount} Readings
            </Link>
          </StampCard>
        </Grid.Col>
        <Grid.Col sm={6} lg={3}>
          <StampCard color="red" icon="alert-circle">
            <Link
              to={"/machine/" + this.props.MachineContract._address + "/alerts"}
            >
              {this.state.metrics.alertsCount} Alerts
            </Link>
          </StampCard>
        </Grid.Col>
        <Grid.Col sm={6} lg={3}>
          <StampCard color="yellow" icon="alert-circle">
            <Link
              to={
                "/machine/" +
                this.props.MachineContract._address +
                "/operations"
              }
            >
              {this.state.metrics.maintenanceOperationsCount} M. Operations
            </Link>
          </StampCard>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default MachineMetrics;
