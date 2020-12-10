// @flow

import * as React from "react";

import ConnectionContext from "../utilities/ConnectionContext";
import { Link } from "react-router-dom";

class ProductDIDResolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "loading" };
  }

  componentDidMount() {
    console.log(this.props.productDID);
    try {
      this.productContract.methods
        .getProductID(this.props.productDID)
        .call()
        .then((result) => {
          if (result.toString() === "") {
            this.setState({ value: this.props.productDID });
          } else {
            this.setState({ value: result });
          }
        })
        .catch((error) => {
          this.setState({ value: this.props.productDID });
        });
    } catch (error) {
      console.log(error);
      this.setState({
        value: "Invalid product DID: '" + this.props.address + "'",
      });
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.productContract = connectionContext.contracts["Product"];
          return (
            <Link to={"/product/" + this.props.productDID} target="_blank">
              {"Product " + this.state.value}
            </Link>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default ProductDIDResolver;
