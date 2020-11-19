// @flow

import * as React from "react";

import { Grid, Card } from "tabler-react";
import StockItem from "./StockItem";

class Stock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stockItems: [],
    };
  }

  componentDidMount() {
    this.props.socket.on("f/i/stock", (message) => {
      if (message.stockItems) {
        this.setData(message.stockItems);
      }
    });
  }

  setData(stockItems) {
    this.setState({ stockItems: stockItems });
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Stocks" isCollapsible>
            <Card.Body>
              <Grid.Row>
                {this.state.stockItems.map((stockItem, i) => (
                  <StockItem
                    key={i}
                    stockItem={stockItem}
                    registry={this.props.registry}
                    web3={this.props.web3}
                  />
                ))}
              </Grid.Row>
            </Card.Body>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default Stock;
