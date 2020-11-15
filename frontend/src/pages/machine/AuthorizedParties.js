import React from "react";
import { Table, Grid, Card, Button, Dimmer } from "tabler-react";

import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";
import AddressResolver from "../utilities/AddressResolver";

class AuthorizedParties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
  }

  getAuthorizedParties() {
    this.props.MachineContract.methods["getAuthorizedProcesses"]()
      .call()
      .then((processesList) => {
        processesList.forEach((element) => {
          this.setState((state, props) => {
            return {
              list: [
                ...this.state.list,
                {
                  address: element,
                },
              ],
            };
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    this.getAuthorizedParties();
  }

  onDeauthorizeButtonClicked(object) {
    var partyAddress = object.address;

    var methodName = null;
    if (object.type.toString() === "Process") {
      methodName = "deauthorizeProcess";
    } else {
      methodName = "deauthorizeMaintainer";
    }

    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.MachineContract.methods[methodName](partyAddress)
          .send({
            from: account,
            gas: process.env.REACT_APP_DEFAULT_GAS,
            gasPrice: process.env.REACT_APP_GAS_PRICE,
          })
          .on("transactionHash", (hash) => {
            this.notificationID = Misc.showTransactionHashMessage(store, hash);
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            store.removeNotification(this.notificationID);
          })
          .on("error", (error) => {
            store.removeNotification(this.notificationID);
            Misc.showErrorMessage(store, error.message);
            console.log(error);
          });
      }
    });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title={"Authorized Processes"} isCollapsible>
            <Dimmer active={false}>
              <Card.Body>
                {this.state.list.length === 0 ? (
                  <div className="emptyListStatus">
                    {"No Authorized Processes."}
                  </div>
                ) : (
                  <Table className="table-vcenter">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColHeader>Name</Table.ColHeader>
                        <Table.ColHeader></Table.ColHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {this.state.list.map((object, i) => (
                        <Table.Row key={this.state.list[i].address}>
                          <Table.Col>
                            <AddressResolver
                              address={this.state.list[i].address}
                            />
                          </Table.Col>
                          <Table.Col>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={this.onDeauthorizeButtonClicked.bind(
                                this,
                                object
                              )}
                            >
                              Deauthorize
                            </Button>
                          </Table.Col>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </Card.Body>
            </Dimmer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default AuthorizedParties;
