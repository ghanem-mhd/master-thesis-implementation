// @flow

import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import { Page, Form, Grid, Button, Alert } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import MachineInfo from "./MachineInfo";
import MachineMetrics from "./MachineMetrics";
import AuthorizedParties from "./AuthorizedParties";
import Misc from "../utilities/Misc";

class Machine extends React.Component {
  componentDidMount() {
    document.title = "Machine Digital Twin";
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content
              title={Misc.getMachines()[this.props.match.params.machine]}
            >
              <MachineMetrics
                contracts={this.contracts}
                machine={this.props.match.params.machine}
              />
              <MachineInfo
                contracts={this.contracts}
                machine={this.props.match.params.machine}
                web3={this.web3}
              />
              <AuthorizedParties
                contracts={this.contracts}
                machine={this.props.match.params.machine}
                web3={this.web3}
              />
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(Machine);
