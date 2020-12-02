import React from "react";

import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { Table, Grid, Card, Page, Dimmer } from "tabler-react";
import ConnectionContext from "../utilities/ConnectionContext";

class Products extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
    };
  }

  getProducts() {
    this.productContract.methods["getProductsCount"]()
      .call()
      .then((productsCount) => {
        this.setState({ loading: false });
        for (let productID = 1; productID <= productsCount; productID++) {
          this.productContract.methods["getProductDID"](productID)
            .call()
            .then((productDID) => {
              var product = {};
              product.ID = productID;
              product.productDID = productDID;
              this.setState((state, props) => {
                return {
                  products: [...this.state.products, product],
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
    document.title = "Products";
    this.getProducts();
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
                    <Card title="Products" isCollapsible isFullscreenable>
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
                                  Product Symbol
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
                                    {"PR" + product.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    <Link
                                      to={"/product/" + product.productDID}
                                      target="_blank"
                                    >
                                      {"did:ethr:" + product.productDID}
                                    </Link>
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
