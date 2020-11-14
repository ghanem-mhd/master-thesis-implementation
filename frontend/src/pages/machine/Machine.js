// @flow

import * as React from "react";
import { withRouter } from "react-router-dom";
import { Page, Dimmer } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import MachineInfo from "./MachineInfo";
import MachineMetrics from "./MachineMetrics";
import AuthorizedParties from "./AuthorizedParties";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class Machine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machineContract: null,
      pageTitle: "Machine Digital Twin",
    };
  }

  componentDidMount() {
    document.title = "Machine Digital Twin";

    ContractsLoader.loadMachineContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.setState({ machineContract: result.metaMaskContract });
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
      });
  }

  render() {
    if (this.state.fatalError) {
      return <ErrorPage errorMessage={this.state.fatalError} />;
    }
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          return (
            <Page.Content
              title={
                <AddressResolver address={this.props.match.params.address} />
              }
            >
              <Dimmer active={this.state.machineContract == null} loader>
                {this.state.machineContract && (
                  <React.Fragment>
                    <MachineMetrics
                      MachineContract={this.state.machineContract}
                    />
                    <MachineInfo
                      MachineContract={this.state.machineContract}
                      web3={this.web3}
                    />
                    <AuthorizedParties
                      web3={this.web3}
                      MachineContract={this.state.machineContract}
                    />
                  </React.Fragment>
                )}
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(Machine);
