// @flow

import * as React from "react";
import { withRouter } from "react-router-dom";
import { Page, Dimmer, Grid, GalleryCard } from "tabler-react";

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
        this.getSymbol(result.metaMaskContract);
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
      });
  }

  getSymbol(machineContract) {
    machineContract.methods
      .getSymbol()
      .call()
      .then((symbol) => {
        this.setState({ symbol: symbol });
      })
      .catch((error) => {
        console.log(error);
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
                    {this.state.symbol && (
                      <Grid.Row>
                        <Grid.Col>
                          <GalleryCard className="align-items-center">
                            <img
                              src={`/${this.state.symbol}.jpg`}
                              alt={`${this.state.symbol}`}
                              className="machineMainImage"
                            />
                          </GalleryCard>
                        </Grid.Col>
                      </Grid.Row>
                    )}
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
