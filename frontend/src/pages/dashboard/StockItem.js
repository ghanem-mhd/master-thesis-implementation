// @flow

import * as React from "react";

import { Card, Grid, Text } from "tabler-react";
import Tooltip from "@material-ui/core/Tooltip";

function getStockItemImage(stockItem) {
  if (stockItem.workpiece == null) {
    return "/empty_stock.svg";
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
    return stockItem.workpiece.id;
  }
}

class StockItem extends React.Component {
  render() {
    return (
      <Grid.Col lg={4} sm={4}>
        <Card>
          <Card.Body>
            <div style={{ textAlign: "center" }}>
              {this.props.stockItem.workpiece == null ? (
                <img
                  className="imageSquare"
                  src={"empty_stock.svg"}
                  alt={getStockItemTitle(this.props.stockItem)}
                />
              ) : (
                <Tooltip
                  title={
                    "did:ethr:" + this.props.stockItem.workpiece.product_DID
                  }
                  placement="top-end"
                >
                  <img
                    className="imageSquare"
                    src={getStockItemImage(this.props.stockItem)}
                    alt={getStockItemTitle(this.props.stockItem)}
                  />
                </Tooltip>
              )}
            </div>
            <Text className="card-subtitle text-center">
              {getStockItemTitle(this.props.stockItem)}
            </Text>
          </Card.Body>
        </Card>
      </Grid.Col>
    );
  }
}

export default StockItem;
