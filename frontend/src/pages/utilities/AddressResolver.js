// @flow

import * as React from "react";

import ConnectionContext from "../utilities/ConnectionContext";

class AddressResolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "loading" };
  }

  componentDidMount() {
    this.resolveAddress(this.props.address);
  }

  resolveAddress(address) {
    try {
      this.registry.methods
        .resolveAddress(address)
        .call()
        .then((result) => {
          if (result.toString() === "") {
            this.setState({ value: address });
          } else {
            this.setState({ value: result });
          }
        })
        .catch((error) => {
          this.setState({ value: address });
        });
    } catch (error) {
      this.setState({
        value: "Invalid ethereum address: '" + address + "'",
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.address !== nextProps.address) {
      this.resolveAddress(nextProps.address);
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.registry = connectionContext.registry;
          return (
            <React.Fragment>
              <span className="d-none d-lg-block">
                <span>{this.state.value}</span>
              </span>
            </React.Fragment>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default AddressResolver;
