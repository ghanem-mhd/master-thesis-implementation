import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";

class MachineAlerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
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

  getMachineAlerts(machine) {
    var MachineContract = this.contracts[machine];
    MachineContract.methods["getAlertsCount"]()
      .call()
      .then((alertsCount) => {
        for (let alertID = 1; alertID <= alertsCount; alertID++) {
          MachineContract.methods["getAlert"](alertID)
            .call()
            .then((alertResult) => {
              var alert = this.getAlertObject(alertResult);
              alert.ID = alertID;
              this.setState((state, props) => {
                var alerts = this.state.alerts;
                alerts.push(alert);
                return {
                  alerts: alerts,
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
    this.getMachineAlerts(this.props.match.params.machine);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.match.params.machine !== nextProps.match.params.machine) {
      this.getMachineAlerts(nextProps.match.params.machine);
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content
              title={this.props.match.params.machine + " Machine Digital Twin"}
            >
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
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(MachineAlerts);
