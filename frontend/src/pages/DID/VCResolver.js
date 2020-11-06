// @flow

import * as React from "react";

import { withRouter } from "react-router";

import { Page, Grid, Card, Form } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import ReactJson from "react-json-view";

import { verifyCredential } from "did-jwt-vc";
import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import didJWT from "did-jwt";

class VCResolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decodeResult: null,
      decodeError: null,
      verificationResult: 0,
    };
    this.initialState = this.state;
  }

  componentDidMount() {
    document.title = "VC Resolver";
    let EthereumDIDRegistryAddress = this.contracts["EthereumDIDRegistry"]
      ._address;
    this.didResolver = new Resolver(
      getResolver({
        provider: this.web3.eth.currentProvider,
        registry: EthereumDIDRegistryAddress,
      })
    );
    if (this.props.match.params.address) {
      this.resolve(this.props.match.params.address);
    }
  }

  onButtonClicked(address) {
    this.resolve(address);
  }

  resolve(credential) {
    verifyCredential(credential, this.didResolver)
      .then((result) => {
        this.setState({ verificationResult: 1, decodeResult: result });
      })
      .catch((error) => {
        try {
          let decodedCredential = didJWT.decodeJWT(credential);
          this.setState({
            decodeResult: decodedCredential,
            decodeError: null,
            verificationResult: 2,
          });
        } catch (error) {
          this.setState({
            decodeResult: null,
            decodeError: error.message,
            verificationResult: null,
          });
        }
      });
  }

  handleChange(event) {
    let value = event.target.value.trim();
    if (value !== "") {
      this.resolve(value);
    } else {
        this.setState(this.initialState)
    }
  }

  render() {
    console.log(this.state);
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content title="Verifiable Credentials Resolver">
              <Grid.Row>
                <Grid.Col>
                  <Form.Group label="Encoded Verifiable Credentials">
                    <Form.Textarea
                      placeholder="Paste a verifiable credential here"
                      name="description"
                      onChange={this.handleChange.bind(this)}
                      rows={5}
                      invalid={this.state.decodeError}
                      feedback={this.state.decodeError}
                    />
                  </Form.Group>
                </Grid.Col>
              </Grid.Row>
              {this.state.decodeResult && (
                <Grid.Row>
                  <Grid.Col>
                    <Card title="Decoded Verifiable Credentials" isCollapsible isFullscreenable>
                      {this.state.verificationResult !== 0 && (
                        <Card.Alert
                          color={
                            this.state.verificationResult === 1
                              ? "success"
                              : "danger"
                          }
                        >
                          {this.state.verificationResult === 1
                            ? "Signature Verified"
                            : "Invalid Signature"}
                        </Card.Alert>
                      )}
                      <Card.Body>
                        <ReactJson
                          src={this.state.decodeResult}
                          collapsed={5}
                          name="Credential"
                          collapseStringsAfterLength={70}
                          indentWidth={4}
                        />
                      </Card.Body>
                    </Card>
                  </Grid.Col>
                </Grid.Row>
              )}
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(VCResolver);
