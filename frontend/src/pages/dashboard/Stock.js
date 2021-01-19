// @flow

import * as React from "react";
import { Link } from "react-router-dom";
import { Grid, Card, Dimmer, Table, Button } from "tabler-react";
import ContractsLoader from "../utilities/ContractsLoader";
import Misc from "../utilities/Misc";
import Select from "react-select";
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
      availableDIDsList: [],
      loading: true,
      errorMessage: null,
      orderButtonEnabled: false,
    };
  }

  componentDidMount() {
    this.props.socket.on("f/i/stock", (message) => {
      this.setData(JSON.parse(JSON.stringify(message)).stockItems);
    });
    this.props.socket.on("connect_error", (err) => {
      this.setState({
        loading: false,
        errorMessage: "Check the connection with the warehouse!",
      });
    });
    this.getProcessesContract();
  }

  async getProcessesContract() {
    try {
      var ProductionProcessAddress = await this.props.registry.methods
        .resolveName("Production Process")
        .call();
      var productionProcessContract = await ContractsLoader.loadProcessContract(
        this.props.web3,
        ProductionProcessAddress
      );
      var SupplyingProcessAddress = await this.props.registry.methods
        .resolveName("Supplying Process")
        .call();
      var supplyingProcessContract = await ContractsLoader.loadProcessContract(
        this.props.web3,
        SupplyingProcessAddress
      );
      this.setState({
        productionProcessContract: productionProcessContract.metaMaskContract,
        supplyingProcessContract: supplyingProcessContract.metaMaskContract,
      });
    } catch (error) {
      console.log(error);
    }
  }

  setData(stockItems) {
    var filledStockItems = stockItems.filter(
      (stockItem) => stockItem.workpiece != null
    );
    var DIDsInStock = filledStockItems.map(
      (stockItem) => stockItem.workpiece.product_DID
    );
    var availableDIDs = Misc.getAvailableProductDIDs(DIDsInStock);
    this.setAvailableDIDs(availableDIDs);
    this.setState({
      stockItems: stockItems.filter((stockItem) => stockItem.workpiece != null),
      loading: false,
    });
  }

  async setAvailableDIDs(availableDIDs) {
    var availableDIDsList = [];
    for (var i = 0; i < availableDIDs.length; i++) {
      var DID = availableDIDs[i];
      var productID = await this.props.productContract.methods
        .getProductID(DID)
        .call();
      availableDIDsList.push({
        label: `Product ${productID} (did:ethr:${DID})`,
        value: DID,
      });
    }
    this.setState({
      availableDIDsList: availableDIDsList,
    });
  }

  onProduceClick(e) {
    let productDID = e.workpiece.product_DID;
    if (this.state.productionProcessContract) {
      this.startProcess(this.state.productionProcessContract, productDID);
    }
  }

  onOrderClick(e) {
    if (this.state.supplyingProcessContract && this.state.selectedDID) {
      this.startProcess(
        this.state.supplyingProcessContract,
        this.state.selectedDID.value
      );
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
            this.setState({ selectedDID: null, orderButtonEnabled: false });
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            store.removeNotification(this.notificationID);
            this.setState({ selectedDID: null, orderButtonEnabled: false });
          })
          .on("error", (error) => {
            store.removeNotification(this.notificationID);
            Misc.showErrorMessage(store, error.message);
          });
      }
    });
  }

  handleEventsSelect(selectedOption) {
    this.setState({ selectedDID: selectedOption, orderButtonEnabled: true });
  }

  render() {
    return (
      <React.Fragment>
        <Grid.Row>
          <Grid.Col>
            <Card title="Produce Products" isCollapsible>
              <Dimmer active={this.state.loading} loader>
                <Card.Body>
                  {this.state.stockItems.length === 0 ? (
                    <div className="emptyListStatus">
                      {this.state.errorMessage !== null
                        ? this.state.errorMessage
                        : "Warehouse is Empty."}
                    </div>
                  ) : (
                    <Table
                      className="table-vcenter"
                      striped={true}
                      responsive={true}
                    >
                      <Table.Header>
                        <Table.Row>
                          <Table.ColHeader alignContent="center">
                            Product
                          </Table.ColHeader>
                          <Table.ColHeader>Product DID</Table.ColHeader>
                          <Table.ColHeader alignContent="center">
                            Physical Identifer
                          </Table.ColHeader>
                          <Table.ColHeader alignContent="center"></Table.ColHeader>
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
                            <Table.Col alignContent="center">
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
        <Grid.Row>
          <Grid.Col>
            <Card title="Order Product to Warehouse" isCollapsible>
              <Dimmer active={this.state.loading} loader>
                <Card.Body>
                  <Select
                    value={this.state.selectedDID}
                    onChange={this.handleEventsSelect.bind(this)}
                    placeholder="Select one product"
                    styles={{
                      menu: (styles) => Object.assign(styles, { zIndex: 1000 }),
                    }}
                    options={this.state.availableDIDsList}
                  />
                </Card.Body>
              </Dimmer>
              <Card.Footer>
                <div align="right">
                  <Button
                    color="primary"
                    onClick={this.onOrderClick.bind(this)}
                    disabled={!this.state.orderButtonEnabled}
                  >
                    Order
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Grid.Col>
        </Grid.Row>
      </React.Fragment>
    );
  }
}

export default Stock;
