// @flow

import * as React from "react";
import { withRouter } from "react-router-dom";

import { Page, Grid, Card, Table, Alert } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import ProductOperations from "./ProductOperations";
import Misc from "../utilities/Misc";
import AddressResolver from "../utilities/AddressResolver";
import DIDLink from "../utilities/DIDLink";
import SaveProductInfo from "./SaveProductInfo";

class Product extends React.Component {
  // eslint-disable-next-line
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.initiateGetProductData(this.props.match.params.address);
  }

  async getProductData(productDID) {
    try {
      var contract = this.ProductContract;
      let createAt = await contract.methods["getProductCreationTime"](
        productDID
      ).call();
      let id = await contract.methods["getProductID"](productDID).call();

      this.setState((state, props) => {
        let product = this.state.product;
        product.info.push({
          infoName: "Product Name",
          infoValue: "Product " + id,
        });
        product.info.push({
          infoName: "Created At",
          infoValue: Misc.formatTimestamp(createAt),
        });
        return {
          product: product,
        };
      });

      let infoNames = await contract.methods["getProductInfoNames"](
        productDID
      ).call();
      if (infoNames.length > 0) {
        for (let infoName of infoNames) {
          let infoValue = await contract.methods["getProductInfo"](
            productDID,
            infoName
          ).call();
          let infoNameString = Misc.toString(this.web3, infoName);
          let infoValueString = Misc.toString(this.web3, infoValue);
          this.setState((state, props) => {
            let product = this.state.product;
            product.info.push({
              infoName: infoNameString,
              infoValue: infoValueString,
            });
            return {
              product: product,
            };
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async initiateGetProductData(productDID) {
    if (productDID == null) {
      return;
    }
    try {
      let productOwner = await this.ProductContract.methods["getProductOwner"](
        productDID
      ).call();
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
        type: "DID",
      });
      newState.product.info.push({
        infoName: "Product Owner",
        infoValue: productOwner,
        type: "address",
      });
      this.setState(newState);
      this.getProductData(productDID);
    } catch (error) {
      console.log(error);
      if (error.message.includes("Product doesn't exist.")) {
        this.setState({
          error: `Product did:ethr:${productDID} doesn't exist.`,
          product: null,
        });
      }
    }
  }

  getInfoValueElement(infoObject) {
    if (infoObject.type == null) {
      return <Table.Col>{infoObject.infoValue}</Table.Col>;
    }
    if (infoObject.type === "address") {
      return (
        <Table.Col>
          <AddressResolver address={infoObject.infoValue} />
        </Table.Col>
      );
    }
    if (infoObject.type === "DID") {
      return (
        <Table.Col>
          <DIDLink DID={infoObject.infoValue} />
        </Table.Col>
      );
    }
  }

  updateCallback() {}

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          this.ProductContract = this.contracts["Product"];
          return (
            <Page.Content title="Product Digital Twin" subTitle="">
              {this.state.error && (
                <Grid.Row className="justify-content-center">
                  <Grid.Col sm={12} lg={6}>
                    <Alert type="danger">{this.state.error}</Alert>
                  </Grid.Col>
                </Grid.Row>
              )}
              {this.state.product && this.state.product.info && (
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
                                {this.getInfoValueElement(
                                  this.state.product.info[i]
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
              {this.state.productDID && (
                <div>
                  <ProductOperations
                    contracts={this.contracts}
                    productDID={this.state.productDID}
                  />
                  {false && (
                    <SaveProductInfo
                      contracts={this.contracts}
                      web3={this.web3}
                      productDID={this.state.productDID}
                      updateCallback={this.updateCallback.bind(this)}
                    />
                  )}
                </div>
              )}
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(Product);
