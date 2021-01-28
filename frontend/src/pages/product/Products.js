import React from "react";
import { Link } from "react-router-dom";

import { withRouter } from "react-router";
import { Table, Grid, Card, Page, Dimmer, Button } from "tabler-react";
import ProductDIDResolver from "./ProductDIDResolver";
import ConnectionContext from "../utilities/ConnectionContext";
import DIDLink from "../utilities/DIDLink";

class Products extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
    };
  }

  async getProducts(c) {
    try {
      let productsCount = await c.methods["getProductsCount"]().call();
      this.setState({ loading: false });
      var products = [];
      for (let productID = 1; productID <= productsCount; productID++) {
        let productDID = await c.methods["getProductDID"](productID).call();
        products.push({ ID: productID, DID: productDID });
      }
      this.setState((state, props) => {
        return {
          products: products,
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    document.title = "Products";
    this.getProducts(this.productContract);
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.productContract = connectionContext.contracts["Product"];
          return (
            <Page.Content
              title={"Products List"}
              subTitle="A list of all products registered in the system"
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row>
                  <Grid.Col>
                    <Card>
                      <Card.Header>
                        <Card.Title>Products</Card.Title>
                        <Card.Options>
                          <Link to={"/create-product/"}>
                            <Button
                              color="success"
                              icon="plus"
                              size="sm"
                              outline={true}
                            >
                              Create
                            </Button>
                          </Link>
                        </Card.Options>
                      </Card.Header>
                      <Card.Body>
                        {this.state.products.length === 0 ? (
                          <div className="emptyListStatus">
                            {"No Products."}
                          </div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader alignContent="center">
                                  ID
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Product Name
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Product DID
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.products.map((product, i) => (
                                <Table.Row key={i}>
                                  <Table.Col alignContent="center">
                                    {product.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    <ProductDIDResolver
                                      productDID={product.DID}
                                    />
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    <DIDLink DID={product.DID} />
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

export default withRouter(Products);
