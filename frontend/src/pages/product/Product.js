// @flow

import * as React from "react";
import { Link } from "react-router-dom";

import { Page, Grid, Card, Table, Alert } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import ProductDIDInput from "./ProductDIDInput";
import ProductOperations from "./ProductOperations";
import Misc from "../utilities/Misc";

class Product extends React.Component {
  componentDidMount() {
    document.title = "Products";
    //this.initiateGetProductData("0xbc437717e7bfc77fbd26d94ef9fc3901291e2482");
  }

  showErrorMessage(message) {
    const notification = this.notificationSystem.current;
    notification.addNotification({
      title: "Error",
      message: message,
      level: "error",
      position: "br",
      autoDismiss: 5,
    });
  }

  getProductData(productDID) {
    var ProductContract = this.contracts["Product"];
    ProductContract.methods["getAuthorizeManufacturer"](productDID)
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var product = this.state.product;
          if (
            result.toString() === "0x0000000000000000000000000000000000000000"
          ) {
            product.info.push({
              infoName: "Authorized Manufacturer",
              infoValue: "None",
            });
          } else {
            product.info.push({
              infoName: "Authorized Manufacturer",
              infoValue: result,
            });
          }
          return {
            product: product,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    ProductContract.methods["getProductCreationTime"](productDID)
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var product = this.state.product;
          product.info.push({
            infoName: "Created At",
            infoValue: Misc.formatTimestamp(result),
          });
          return {
            product: product,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    ProductContract.methods["getProductInfoNames"](productDID)
      .call()
      .then((infoNames) => {
        if (infoNames.length > 0) {
          for (let infoName of infoNames) {
            ProductContract.methods["getProductInfo"](productDID, infoName)
              .call()
              .then((infoValue) => {
                var infoNameString = Misc.toString(this.web3, infoName);
                var infoValueString = Misc.toString(this.web3, infoValue);
                this.setState((state, props) => {
                  var product = this.state.product;
                  product.info.push({
                    infoName: infoNameString,
                    infoValue: infoValueString,
                  });
                  return {
                    product: product,
                  };
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  initiateGetProductData(productDID) {
    var ProductContract = this.contracts["Product"];
    ProductContract.methods["getProductOwner"](productDID)
      .call()
      .then((result) => {
        var newState = {};
        newState.productDID = productDID;
        newState.error = null;
        newState.product = {};
        newState.product.info = [];
        newState.product.operations = [];

        var fullProductDID = "did:ethr:" + productDID;
        newState.product.info.push({
          infoName: "Product DID",
          infoValue: fullProductDID,
          link: "/did-resolver/" + productDID,
        });
        newState.product.info.push({
          infoName: "Product Owner",
          infoValue: result,
        });
        this.setState(newState);
        this.getProductData(productDID);
      })
      .catch((error) => {
        console.log(error);
        if (error.message.includes("Product doesn't exist.")) {
          this.setState({
            error: `Product did:ethr:${productDID} doesn't exist.`,
            product: null,
          });
        }
      });
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content title="Product Digital Twin">
              <ProductDIDInput
                onFindButtonClicked={this.initiateGetProductData.bind(this)}
                web3={this.web3}
              />
              {this.state && this.state.error && (
                <Grid.Row className="justify-content-center">
                  <Grid.Col sm={12} lg={6}>
                    <Alert type="danger">{this.state.error}</Alert>
                  </Grid.Col>
                </Grid.Row>
              )}
              {this.state && this.state.product && this.state.product.info && (
                <Grid.Row>
                  <Grid.Col>
                    <Card title="Product Info" isCollapsible isFullscreenable>
                      <Card.Body>
                        <Table>
                          <Table.Header>
                            <Table.Row>
                              <Table.ColHeader>Info Name</Table.ColHeader>
                              <Table.ColHeader>Info Value</Table.ColHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {this.state.product.info.map((object, i) => (
                              <Table.Row
                                key={this.state.product.info[i].infoName}
                              >
                                <Table.Col>
                                  {this.state.product.info[i].infoName}
                                </Table.Col>
                                {this.state.product.info[i].link && (
                                  <Table.Col>
                                    <Link
                                      to={this.state.product.info[i].link}
                                      target="_blank"
                                    >
                                      {this.state.product.info[i].infoValue}
                                    </Link>
                                  </Table.Col>
                                )}
                                {!this.state.product.info[i].link && (
                                  <Table.Col>
                                    {this.state.product.info[i].infoValue}
                                  </Table.Col>
                                )}
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Grid.Col>
                </Grid.Row>
              )}
              {this.state && this.state.productDID && (
                <ProductOperations
                  contracts={this.contracts}
                  productDID={this.state.productDID}
                />
              )}
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default Product;
