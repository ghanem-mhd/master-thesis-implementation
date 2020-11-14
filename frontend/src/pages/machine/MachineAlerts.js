import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class MachineAlerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      loading: true,
    };
  }

  getAlertObject(AlertResult) {
    var alert = {};
    alert.time = Misc.formatTimestamp(AlertResult[0]);
    alert.readingID = AlertResult[1];
    alert.reason = AlertResult[2];
    alert.type = AlertResult[3];
    return alert;
  }

  getMachineAlerts(MachineContract) {
    MachineContract.methods["getAlertsCount"]()
      .call()
      .then((alertsCount) => {
        this.setState({ loading: false });
        for (let alertID = 1; alertID <= alertsCount; alertID++) {
          MachineContract.methods["getAlert"](alertID)
            .call()
            .then((alertResult) => {
              var alert = this.getAlertObject(alertResult);
              alert.ID = alertID;
              this.setState((state, props) => {
                return {
                  alerts: [...this.state.alerts, alert],
                };
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    document.title = "Machine Alerts";
    ContractsLoader.loadMachineContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.getMachineAlerts(result.metaMaskContract);
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
      });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.match.params.address !== nextProps.match.params.address) {
      this.getMachineAlerts(nextProps.match.params.machine);
    }
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
              subTitle="A list of all alerts created by the smart contract of of the machine"
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row>
                  <Grid.Col>
                    <Card title="Machine Alerts" isCollapsible isFullscreenable>
                      <Card.Body>
                        {this.state.alerts.length === 0 ? (
                          <div className="emptyListStatus">{"No Alerts."}</div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader alignContent="center">
                                  ID
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Type
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Reason
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Time
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Reading ID
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.alerts.map((alert, i) => (
                                <Table.Row key={alert.ID}>
                                  <Table.Col alignContent="center">
                                    {alert.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {alert.type}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {alert.reason}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {alert.time}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {alert.readingID}
                                  </Table.Col>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
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

export default withRouter(MachineAlerts);
