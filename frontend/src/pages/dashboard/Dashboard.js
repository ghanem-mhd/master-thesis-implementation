// @flow

import * as React from "react";
import { Link } from "react-router-dom";

import ProcessStepper from "../process/ProcessStepper";
import { Page, Grid, StampCard } from "tabler-react";
import Misc from "../utilities/Misc";
import EventsLogStreamTable from "../log/EventsLogStreamTable";
import ConnectionContext from "../utilities/ConnectionContext";

function getStateElement(state) {
  let className = "";
  let stateLabel = "";
  if (state === -1) {
    className = "status-icon bg-danger";
    stateLabel = "Discontented";
  }
  if (state === 0) {
    className = "status-icon bg-warning";
    stateLabel = "Idle";
  }
  if (state === 1) {
    className = "status-icon bg-success";
    stateLabel = "Active";
  }
  return (
    <div>
      <span className={className} />
      {" " + stateLabel}
    </div>
  );
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      VGR: { state: -1 },
      HBW: { state: -1 },
      MPO: { state: -1 },
      SLD: { state: -1 },
    };
  }

  componentDidMount() {
    document.title = "Dashboard";

    this.socket.on("VGR_state", (state) => {
      this.setState({ VGR: { state: state } });
    });

    this.socket.on("HBW_state", (state) => {
      this.setState({ HBW: { state: state } });
    });

    this.socket.on("MPO_state", (state) => {
      this.setState({ MPO: { state: state } });
    });

    this.socket.on("SLD_state", (state) => {
      this.setState({ SLD: { state: state } });
    });
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.socket = connectionContext.socket;
          return (
            <Page.Content title="Dashboard">
              <Grid.Row cards={true}>
                {["VGR", "HBW", "MPO", "SLD"].map((machine, index) => {
                  return (
                    <Grid.Col sm={6} lg={3} key={machine}>
                      <StampCard
                        icon="activity"
                        color="blue"
                        header={
                          <Link to={"/machine/" + machine}>
                            <small>{machine + "Machine Status"}</small>
                          </Link>
                        }
                        footer={getStateElement(this.state[machine].state)}
                      ></StampCard>
                    </Grid.Col>
                  );
                })}
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
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default Dashboard;
