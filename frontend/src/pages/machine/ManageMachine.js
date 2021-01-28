// @flow

import * as React from "react";
import { withRouter } from "react-router";

import { Page, Dimmer } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import AuthorizeParty from "./AuthorizeParty";
import SaveMachineInfo from "./SaveMachineInfo";
import RequestReading from "./RequestReading";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class ManageMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    document.title = "Manage Machine";
    ContractsLoader.loadMachineContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.setState({
          machineContract: result.metaMaskContract,
          loading: false,
        });
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
                <AddressResolver
                  address={this.props.match.params.address}
                  prefix="Manage "
                />
              }
              subTitle=""
            >
              <Dimmer active={this.state.loading} loader>
                {this.state.machineContract && (
                  <React.Fragment>
                    <AuthorizeParty
                      web3={this.web3}
                      MachineContract={this.state.machineContract}
                    />
                    <SaveMachineInfo
                      web3={this.web3}
                      MachineContract={this.state.machineContract}
                    />
                    <RequestReading
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

export default withRouter(ManageMachine);
