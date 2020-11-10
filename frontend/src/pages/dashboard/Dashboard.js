// @flow

import * as React from "react";

import ProcessStepper from "../process/ProcessStepper";
import { Page, Grid } from "tabler-react";
import Misc from "../utilities/Misc";
import EventsLogStreamTable from "../log/EventsLogStreamTable";
import ConnectionContext from "../utilities/ConnectionContext";
import MachineState from "../machine/MachineState";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = "Dashboard";
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.socket = connectionContext.socket;
          this.contracts = connectionContext.wsContracts;
          return (
            <Page.Content title="Dashboard">
              <Grid.Row cards={true}>
                {["VGR", "HBW", "MPO", "SLD"].map((machine, index) => {
                  return (
                    <Grid.Col sm={6} lg={3} key={machine}>
                      <MachineState
                        machine={machine}
                        contract={this.contracts[machine]}
                      />
                    </Grid.Col>
                  );
                })}
              </Grid.Row>
              <ProcessStepper
                contract={this.contracts["SupplyingProcess"]}
                title="Supplying Process Status"
                steps={Misc.getSupplyingSteps()}
              />
              <ProcessStepper
                contract={this.contracts["ProductionProcess"]}
                title="Production Process Status"
                steps={Misc.getProductionSteps()}
              />
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default Dashboard;
