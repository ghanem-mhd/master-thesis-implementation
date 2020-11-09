// @flow

import * as React from "react";
import { Link } from "react-router-dom";

import ProcessStepper from "../process/ProcessStepper";
import { Page, Grid, StampCard, Card } from "tabler-react";
import Misc from "../utilities/Misc";
import EventsLogStreamTable from "../log/EventsLogStreamTable";

class Dashboard extends React.Component {
  componentDidMount() {
    document.title = "Dashboard";
  }

  render() {
    return (
      <Page.Content title="Dashboard">
        <Grid.Row cards={true}>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              icon="activity"
              color="blue"
              header={
                <Link to="/machine/VGR">
                  <small>VGR Machine Status</small>
                </Link>
              }
              footer={
                <div>
                  <span className="status-icon bg-success" />
                  {" Active"}
                </div>
              }
            ></StampCard>
          </Grid.Col>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              icon="activity"
              color="blue"
              header={
                <Link to="/machine/HBW">
                  <small>HBW Machine Status</small>
                </Link>
              }
              footer={
                <div>
                  <span className="status-icon bg-warning" />
                  {" Not Active"}
                </div>
              }
            ></StampCard>
          </Grid.Col>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              icon="activity"
              color="blue"
              header={
                <Link to="/machine/MPO">
                  <small>MPO Machine Status</small>
                </Link>
              }
              footer={
                <div>
                  <span className="status-icon bg-warning" />
                  {" Not Active"}
                </div>
              }
            ></StampCard>
          </Grid.Col>
          <Grid.Col sm={6} lg={3}>
            <StampCard
              icon="activity"
              color="blue"
              header={
                <Link to="/machine/SLD">
                  <small>SLD Machine Status</small>
                </Link>
              }
              footer={
                <div>
                  <span className="status-icon bg-warning" />
                  {" Not Active"}
                </div>
              }
            ></StampCard>
          </Grid.Col>
        </Grid.Row>
        <ProcessStepper
          title="Supplying Process Status"
          steps={Misc.getSupplyingSteps()}
          activeStep={-1}
        />
        <ProcessStepper
          title="Production Process Status"
          steps={Misc.getProductionSteps()}
          activeStep={-1}
        />
        <EventsLogStreamTable title="Events Log - Stream" />
      </Page.Content>
    );
  }
}

export default Dashboard;
