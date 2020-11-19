// @flow

import * as React from "react";

import { Card, Button, Text, Grid } from "tabler-react";
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

function getStockItemTitle(stockItem) {
  if (stockItem.workpiece === null) {
    return "Empty Container";
  } else {
    return stockItem.workpiece.product_DID;
  }
}

class Product extends React.Component {
  onButtonClick(e) {
    this.props.registry.methods
      .resolveName("Production Process")
      .call()
      .then((ProductionProcessAddress) => {
        ContractsLoader.loadProcessContract(
          this.props.web3,
          ProductionProcessAddress
        )
          .then((result) => {
            this.startProcess(
              result.metaMaskContract,
              this.props.stockItem.workpiece.product_DID
            );
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
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
      <Grid.Col lg={4} sm={4}>
        <Card>
          <Card.Body className="text-center">
            <div className="imgClassName mb-6">
              <img
                src={getStockItemImage(this.props.stockItem)}
                alt={getStockItemTitle(this.props.stockItem)}
              />
            </div>
            <Text className="card-subtitle">
              {getStockItemTitle(this.props.stockItem)}
            </Text>
            <Button
              color="primary"
              size="sm"
              onClick={this.onButtonClick.bind(this)}
            >
              Produce
            </Button>
          </Card.Body>
        </Card>
      </Grid.Col>
    );
  }
}

export default Product;
