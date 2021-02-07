import React from "react";
import { Table, Grid, Card, Button, Dimmer } from "tabler-react";

import { store } from "react-notifications-component";
import Misc from "../utilities/Misc";
import AddressResolver from "../utilities/AddressResolver";

class AuthorizedParties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processesList: [],
    };
  }

  async getAuthorizedParties() {
    try {
      var processesList = await this.props.MachineContract.methods[
        "getAuthorizedProcesses"
      ]().call();
      this.setState((state, props) => {
        return {
          processesList: processesList,
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    this.getAuthorizedParties();
  }

  onDeauthorizeButtonClicked(object) {
    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        this.props.MachineContract.methods["deauthorizeProcess"](object)
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
          <Card
            title={"Authorized Processes"}
            isFullscreenable
            isClosable
            isCollapsible
          >
            <Dimmer active={false}>
              <Card.Body>
                {this.state.processesList.length === 0 ? (
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
                      {this.state.processesList.map((object, i) => (
                        <Table.Row key={this.state.processesList[i]}>
                          <Table.Col>
                            <AddressResolver
                              address={this.state.processesList[i]}
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
