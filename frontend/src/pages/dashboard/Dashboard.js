// @flow

import * as React from "react";

import { Page, Dimmer, Grid } from "tabler-react";
import ConnectionContext from "../utilities/ConnectionContext";
import MachineState from "../machine/MachineState";
import ErrorPage from "../utilities/ErrorPage";
import Stock from "./Stock";
import NFCRead from "./NFCRead";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processes: [],
      loading: false,
    };
  }

  componentDidMount() {
    document.title = "Dashboard";
  }

  render() {
    if (this.state.fatalError) {
      return <ErrorPage errorMessage={this.state.fatalError} />;
    }
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.registry = connectionContext.registry;
          this.socket = connectionContext.socket;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content
              title="Dashboard"
              subTitle="Real time monitoring for machines and processes"
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row cards={true}>
                  {[
                    "Vacuum Gripper Robot (VGR) - FIT",
                    "High-Bay Warehouse (HBW) - FIT",
                    "Multi-Processing Station (MPO) - FIT",
                    "Sorting Line with Color Detection (SLD) - FIT",
                  ].map((machineName, index) => (
                    <Grid.Col sm={12} lg={6} key={machineName}>
                      <MachineState
                        registry={this.registry}
                        web3={this.web3}
                        machineName={machineName}
                      />
                    </Grid.Col>
                  ))}
                </Grid.Row>
                <Stock
                  registry={this.registry}
                  socket={this.socket}
                  web3={this.web3}
                  productContract={this.contracts["Product"]}
                />
                <Grid.Row>
                  <Grid.Col>
                    <NFCRead
                      registry={this.registry}
                      socket={this.socket}
                      web3={this.web3}
                      productContract={this.contracts["Product"]}
                    />
                  </Grid.Col>
                </Grid.Row>
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default Dashboard;
