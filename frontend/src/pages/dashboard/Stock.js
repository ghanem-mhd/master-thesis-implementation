// @flow

import * as React from "react";
import { Link } from "react-router-dom";
import { Grid, Card, Dimmer, Table, Button } from "tabler-react";
import ContractsLoader from "../utilities/ContractsLoader";
import Misc from "../utilities/Misc";
import { store } from "react-notifications-component";

function getStockItemImage(stockItem) {
  if (stockItem.workpiece == null) {
    return "";
  }

  if (stockItem.workpiece.type === "RED") {
    return "/ic_ft_workpiece_red.svg";
  }

  if (stockItem.workpiece.type === "BLUE") {
    return "/ic_ft_workpiece_blue.svg";
  }

  if (stockItem.workpiece.type === "WHITE") {
    return "/ic_ft_workpiece_white.svg";
  }
}

class Stock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stockItems: [],
      loading: true,
      errorMessage: null,
    };
  }

  componentDidMount() {
    this.props.socket.on("f/i/stock", (message) => {
      if (message.stockItems) {
        this.setData(message.stockItems);
      }
    });
    this.props.socket.on("connect_error", (err) => {
      this.setState({
        loading: false,
        //errorMessage: "Check the connection with the warehouse!",
      });
    });
    this.props.registry.methods
      .resolveName("Production Process")
      .call()
      .then((ProductionProcessAddress) => {
        ContractsLoader.loadProcessContract(
          this.props.web3,
          ProductionProcessAddress
        )
          .then((result) => {
            this.setState({ processContract: result.metaMaskContract });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setData(stockItems) {
    stockItems = stockItems.filter((stockItem) => stockItem.workpiece != null);
    this.setState({ stockItems: stockItems, loading: false });
  }

  onProduceClick(e) {
    let productDID = e.workpiece.product_DID;
    if (this.state.processContract) {
      this.startProcess(this.state.processContract, productDID);
    }
  }

  startProcess(processContract, productDID) {
    Misc.getCurrentAccount(this.props.web3, (error, account) => {
      if (error) {
        Misc.showAccountNotConnectedNotification(store);
      } else {
        processContract.methods["startProcess"](productDID)
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
          <Card title="Stocks" isCollapsible>
            <Dimmer loader={this.state.loading}>
              <Card.Body>
                {this.state.stockItems.length === 0 ? (
                  <div className="emptyListStatus">
                    {this.state.errorMessage !== null
                      ? this.state.errorMessage
                      : "Stock is Empty."}
                  </div>
                ) : (
                  <Table className="table-vcenter">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColHeader alignContent="center">
                          Product
                        </Table.ColHeader>
                        <Table.ColHeader>Product DID</Table.ColHeader>
                        <Table.ColHeader alignContent="center">
                          Physical Identifer
                        </Table.ColHeader>
                        <Table.ColHeader></Table.ColHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {this.state.stockItems.map((stockItem, i) => (
                        <Table.Row key={i}>
                          <Table.Col alignContent="center">
                            <img
                              className="imgClassName"
                              src={getStockItemImage(stockItem)}
                              alt={stockItem.workpiece.product_DID}
                            />
                          </Table.Col>
                          <Table.Col>
                            <Link
                              to={stockItem.workpiece.product_DID}
                              target="_blank"
                            >
                              {"did:ethr:" + stockItem.workpiece.product_DID}
                            </Link>
                          </Table.Col>
                          <Table.Col alignContent="center">
                            {stockItem.workpiece.id}
                          </Table.Col>
                          <Table.Col>
                            <Button
                              color="primary"
                              size="sm"
                              onClick={this.onProduceClick.bind(
                                this,
                                stockItem
                              )}
                            >
                              Produce
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

export default Stock;
