// @flow

import * as React from "react";

import ConnectionContext from "../utilities/ConnectionContext";

class AddressResolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "loading" };
  }

  componentDidMount() {
    try {
      this.registry.methods
        .resolveAddress(this.props.address)
        .call()
        .then((result) => {
          if (result.toString() === "") {
            this.setState({ value: this.props.address });
          } else {
            this.setState({ value: result });
          }
        })
        .catch((error) => {
          this.setState({ value: this.props.address });
        });
    } catch (error) {
      this.setState({
        value: "Invalid ethereum address: '" + this.props.address + "'",
      });
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
                <span className="text-default">{this.state.value}</span>
              </span>
            </React.Fragment>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default AddressResolver;
