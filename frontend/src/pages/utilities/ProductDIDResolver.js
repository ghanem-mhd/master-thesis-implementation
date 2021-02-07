// @flow

import * as React from "react";
import { Link } from "react-router-dom";

import ConnectionContext from "../utilities/ConnectionContext";

class ProductDIDResolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "loading" };
  }

  componentDidMount() {
    this.resolveDID(this.props.productDID);
  }

  resolveDID(productDID) {
    try {
      this.productContract.methods
        .getProductID(productDID)
        .call()
        .then((result) => {
          if (result.toString() === "") {
            this.setState({ value: productDID });
          } else {
            this.setState({ value: result });
          }
        })
        .catch((error) => {
          this.setState({ value: productDID });
        });
    } catch (error) {
      this.setState({
        value: "Invalid product DID: 'did:ethr:" + productDID + "'",
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.productDID !== nextProps.productDID) {
      this.resolveDID(nextProps.productDID);
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.productContract = connectionContext.contracts["Product"];
          return (
            <Link to={"/product/" + this.props.productDID} target="_blank">
              <span className="d-none d-lg-block">
                <span>{"Product " + this.state.value}</span>
              </span>
            </Link>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default ProductDIDResolver;
