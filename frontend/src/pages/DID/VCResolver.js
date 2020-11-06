// @flow

import * as React from "react";

import { withRouter } from "react-router";

import { Page, Grid, Card, Form, Dimmer } from "tabler-react";

import ConnectionContext from "../utilities/ConnectionContext";
import ReactJson from "react-json-view";

import { verifyCredential } from "did-jwt-vc";
import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import didJWT from "did-jwt";

const VC_URL = process.env.REACT_APP_BACKEND_BASE_URL + "operation-vc/";

class VCResolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      encodedInput: "",
      decodeOutput: null,
      decodeError: null,
      loading: false,
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
    if (this.props.match.params.operationID) {
      this.setState({loading:true})
      fetch(VC_URL + this.props.match.params.operationID)
        .then((response) => response.json())
        .then((response) => {
          console.log(response)
          this.resolve(response.vc);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  resolve(encodedCredential) {
    verifyCredential(encodedCredential, this.didResolver)
      .then((result) => {
        this.setState({
          verificationResult: 1,
          decodeOutput: result,
          decodeError:null,
          encodedInput: encodedCredential,
          loading: false
        });
      })
      .catch((error) => {
        try {
          let decodedCredential = didJWT.decodeJWT(encodedCredential);
          this.setState({
            encodedInput: encodedCredential,
            decodeOutput: decodedCredential,
            decodeError: null,
            verificationResult: 2,
            loading: false
          });
        } catch (error) {
          this.setState({
            encodedInput: encodedCredential,
            decodeOutput: null,
            decodeError: error.message,
            verificationResult: null,
            loading: false
          });
        }
      });
  }

  handleChange(event) {
    let inputText = event.target.value.trim();
    if (inputText !== "") {
      this.resolve(inputText);
    } else {
      this.setState(this.initialState);
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contracts = connectionContext.contracts;
          return (
            <Page.Content title="Verifiable Credentials Resolver">
              <Dimmer active={this.state.loading} loader>
                <Grid.Row>
                  <Grid.Col>
                    <Form.Group label="Encoded Verifiable Credentials">
                      <Form.Textarea
                        placeholder="Paste a verifiable credential here"
                        name="description"
                        onChange={this.handleChange.bind(this)}
                        rows={5}
                        value={this.state.encodedInput}
                        invalid={this.state.decodeError}
                        feedback={this.state.decodeError}
                      />
                    </Form.Group>
                  </Grid.Col>
                </Grid.Row>
                {this.state.decodeOutput && (
                  <Grid.Row>
                    <Grid.Col>
                      <Card
                        title="Decoded Verifiable Credentials"
                        isCollapsible
                        isFullscreenable
                      >
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
                            src={this.state.decodeOutput}
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
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(VCResolver);
