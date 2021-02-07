// @flow

import * as React from "react";
import { withRouter } from "react-router-dom";
import { Page, Dimmer } from "tabler-react";

import ProcessInfo from "./ProcessInfo";
import StartProcess from "./StartProcess";
import ProcessStepper from "./ProcessStepper";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class Process extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processContract: null,
    };
  }

  componentDidMount() {
    document.title = "Process";

    ContractsLoader.loadProcessContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.setState({ processContract: result.metaMaskContract });
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
          this.registry = connectionContext.registry;
          return (
            <Page.Content
              title={
                <AddressResolver address={this.props.match.params.address} />
              }
            >
              <Dimmer active={this.state.processContract == null} loader>
                {this.state.processContract && (
                  <React.Fragment>
                    <ProcessInfo ProcessContract={this.state.processContract} />
                    <StartProcess
                      registry={this.registry}
                      web3={this.web3}
                      ProcessContract={this.state.processContract}
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

export default withRouter(Process);
