// @flow

import * as React from "react";
import { Grid, Card, Dimmer, Button } from "tabler-react";
import EventsLogStreamTable from "../log/EventsLogStreamTable";
import ContractsLoader from "../utilities/ContractsLoader";
import Misc from "../utilities/Misc";
import Select from "react-select";
import ProcessStepper from "../process/ProcessStepper";
import { store } from "react-notifications-component";
import StockItem from "./StockItem";

function getStockItemImage(type) {
  if (type == null) {
    return "";
  }

  if (type === "RED") {
    return "/ic_ft_workpiece_red.svg";
  }

  if (type === "BLUE") {
    return "/ic_ft_workpiece_blue.svg";
  }

  if (type === "WHITE") {
    return "/ic_ft_workpiece_white.svg";
  }
}

class Stock extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      stockItems: [],
      availableDIDsList: [],
      filledStockItems: [],
      loading: true,
      errorMessage: null,
      executeButton1Enabled: false,
      executeButton2Enabled: false,
      lastTimestamp: "N/A",
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.socket.on("f/i/stock", (message) => {
      if (this._isMounted) {
        this.setData(
          JSON.parse(JSON.stringify(message)).stockItems,
          message.ts
        );
      }
    });
    this.props.socket.on("connect_error", (err) => {
      this.setState({
        loading: false,
        errorMessage: "Check the connection with the warehouse!",
      });
    });
    this.getProcessesContract();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.props.socket.off("f/i/stock");
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

  setData(stockItems, timestamp) {
    this.setState({
      lastTimestamp: new Date(timestamp).toLocaleString(),
      loading: false,
      stockItems: stockItems,
    });
    this.setAvailableDIDs(stockItems);
    this.setFilledStockItems(stockItems);
  }

  async setAvailableDIDs(stockItems) {
    var filledStockItems = stockItems.filter(
      (stockItem) => stockItem.workpiece != null
    );
    var DIDsInStock = filledStockItems.map(
      (stockItem) => stockItem.workpiece.product_DID
    );
    var availableDIDs = Misc.getAvailableProductDIDs(DIDsInStock);
    var availableDIDsList = [];
    for (var i = 0; i < availableDIDs.length; i++) {
      var DID = availableDIDs[i];
      try {
        var productID = await this.props.productContract.methods
          .getProductID(DID)
          .call();
        availableDIDsList.push({
          label: `Product ${productID} (did:ethr:${DID})`,
          value: DID,
        });
      } catch (error) {
        console.log(error);
      }
    }
    this.setState({
      availableDIDsList: availableDIDsList,
    });
  }

  async setFilledStockItems(stockItems) {
    stockItems = stockItems.filter((stockItem) => stockItem.workpiece != null);
    var filledStockItems = [];
    for (var i = 0; i < stockItems.length; i++) {
      var stockItem = stockItems[i];
      try {
        var productID = await this.props.productContract.methods
          .getProductID(stockItem.workpiece.product_DID)
          .call();
      } catch (error) {
        productID = "Unknown";
      }
      filledStockItems.push({
        value: stockItem.workpiece.product_DID,
        productID: productID,
        physicalID: stockItem.workpiece.id,
        type: stockItem.workpiece.type,
      });
    }
    this.setState({
      filledStockItems: filledStockItems,
    });
  }

  onExecuteButtonClicked(e) {
    if (e === "Supplying") {
      if (
        this.state.supplyingProcessContract &&
        this.state.selectedSupplyingProduct
      ) {
        this.startProcess(
          this.state.supplyingProcessContract,
          this.state.selectedSupplyingProduct.value
        );
      }
    } else {
      if (
        this.state.productionProcessContract &&
        this.state.selectedProductionProduct
      ) {
        this.startProcess(
          this.state.productionProcessContract,
          this.state.selectedProductionProduct.value
        );
      }
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
            this.reset();
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            store.removeNotification(this.notificationID);
            this.reset();
          })
          .on("error", (error) => {
            store.removeNotification(this.notificationID);
            Misc.showErrorMessage(store, error.message);
          });
      }
    });
  }

  reset() {
    this.setState({
      selectedSupplyingProduct: null,
      selectedProductionProduct: null,
      executeButton1Enabled: false,
      executeButton2Enabled: false,
    });
  }

  handleSupplyingProductSelection(selectedOption) {
    this.setState({
      selectedSupplyingProduct: selectedOption,
      executeButton1Enabled: true,
    });
  }

  handleProductionProductSelection(selectedOption) {
    this.setState({
      selectedProductionProduct: selectedOption,
      executeButton2Enabled: true,
    });
  }

  formatOptionLabel(option) {
    return (
      <Grid.Row>
        <Grid.Col lg={2} sm={2} className="text-lg-center">
          <img
            alt={option.value}
            className="productSmall"
            src={getStockItemImage(option.type)}
          />
        </Grid.Col>
        <Grid.Col lg={7} sm={7}>
          {`Product ${option.productID} (did:ethr:${option.value})`}
        </Grid.Col>
        <Grid.Col lg={3} sm={3}>
          {`NFC: ${option.physicalID}`}
        </Grid.Col>
      </Grid.Row>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Grid.Row>
          <Grid.Col>
            <Card
              title="Supplying Process"
              isFullscreenable
              isClosable
              isCollapsible
            >
              <Dimmer active={this.state.loading} loader>
                <Card.Body>
                  <Select
                    value={this.state.selectedSupplyingProduct}
                    onChange={this.handleSupplyingProductSelection.bind(this)}
                    placeholder="Select a product"
                    styles={{
                      menu: (styles) => Object.assign(styles, { zIndex: 1000 }),
                    }}
                    options={this.state.availableDIDsList}
                  />
                </Card.Body>
                <ProcessStepper
                  registry={this.props.registry}
                  web3={this.props.web3}
                  processName={"Supplying Process"}
                  showDetails={false}
                />
              </Dimmer>
              <Card.Footer>
                <div style={{ float: "left" }}>
                  Ordering a product will execute a new supplying process
                  instance.
                </div>
                <div style={{ float: "right" }}>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={this.onExecuteButtonClicked.bind(
                      this,
                      "Supplying"
                    )}
                    disabled={!this.state.executeButton1Enabled}
                  >
                    Execute
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col>
            <Card
              title="Production Process"
              isFullscreenable
              isClosable
              isCollapsible
            >
              <Dimmer active={this.state.loading} loader>
                <Card.Body>
                  <Select
                    value={this.state.selectedProductionProduct}
                    formatOptionLabel={this.formatOptionLabel}
                    onChange={this.handleProductionProductSelection.bind(this)}
                    placeholder="Select a product"
                    styles={{
                      menu: (styles) => Object.assign(styles, { zIndex: 1000 }),
                    }}
                    options={this.state.filledStockItems}
                  />
                </Card.Body>
                <ProcessStepper
                  registry={this.props.registry}
                  web3={this.props.web3}
                  processName={"Production Process"}
                  showDetails={false}
                />
              </Dimmer>
              <Card.Footer>
                <div style={{ float: "left" }}>
                  Producing a product will execute a new production process
                  instance.
                </div>
                <div style={{ float: "right" }}>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={this.onExecuteButtonClicked.bind(
                      this,
                      "Production"
                    )}
                    disabled={!this.state.executeButton2Enabled}
                  >
                    Execute
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Grid.Col>
        </Grid.Row>
        <EventsLogStreamTable title={"Events Log"} />
        {true && (
          <Grid.Row>
            <Grid.Col>
              <Card
                title="Warehouse Storage"
                isFullscreenable
                isClosable
                isCollapsible
              >
                <Card.Body>
                  <Dimmer
                    active={this.state.loading}
                    loader
                    className="dimmerCentered"
                  >
                    <Grid.Row gutters="xs">
                      {this.state.stockItems.map((stockItem, i) => (
                        <StockItem
                          key={i}
                          stockItem={stockItem}
                          registry={this.props.registry}
                          web3={this.props.web3}
                        />
                      ))}
                    </Grid.Row>
                  </Dimmer>
                </Card.Body>
                <Card.Footer>
                  <div style={{ float: "left" }}>
                    <b>Last update::</b>
                    {this.state.lastTimestamp}
                  </div>
                  <div style={{ float: "right" }}>
                    <Button className="invisible" size="sm" color="primary">
                      Execute
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Grid.Col>
          </Grid.Row>
        )}
      </React.Fragment>
    );
  }
}

export default Stock;
