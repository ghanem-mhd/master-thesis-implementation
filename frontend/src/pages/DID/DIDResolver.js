// @flow

import * as React from "react";

import { withRouter } from "react-router";

import {
  Page,
  Grid,
  Card,
  Alert
} from "tabler-react";

import ConnectionContext from '../utilities/ConnectionContext';
import DIDInput from './DIDInput';
import ReactJson from 'react-json-view';

import didJWT from 'did-jwt';
import {Resolver}  from 'did-resolver';
import {getResolver} from 'ethr-did-resolver';

class DIDResolver extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            DIDDocument: null,
            error:null
        }
    }

    componentDidMount() {
        document.title                  = "DID Resolver";
        let EthereumDIDRegistryAddress  = this.contracts["EthereumDIDRegistry"]._address
        this.didResolver                = new Resolver(getResolver({provider: this.web3.eth.currentProvider, registry:EthereumDIDRegistryAddress}));
        if (this.props.match.params.address){
            this.resolve(this.props.match.params.address)
        }
    }

    onButtonClicked(address){
        this.resolve(address)
    }

    resolve(address){
        this.didResolver.resolve('did:ethr:' + address).then( result => {
            this.setState({DIDDocument:result, error:null});
        }).catch( error => {
            this.setState({error:error.message, DIDDocument:null});
        });
    }

    render () {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                this.web3       = connectionContext.web3;
                this.contracts  = connectionContext.contracts;
                return (
                    <Page.Content title="DID Resolver">
                        <DIDInput onButtonClicked={this.onButtonClicked.bind(this)} web3={this.web3} value={this.props.match.params.address}/>
                        {this.state.error &&
                                <Grid.Row className="justify-content-center">
                                    <Grid.Col sm={12} lg={6}>
                                        <Alert type="danger">{this.state.error}</Alert>
                                    </Grid.Col>
                                </Grid.Row>
                        }
                        {this.state.DIDDocument &&
                        <Grid.Row>
                            <Grid.Col>
                                <Card title ="DID Document">
                                    <Card.Body>
                                        <ReactJson src={this.state.DIDDocument}
                                            collapsed={3}
                                            name="DID Document"
                                            collapseStringsAfterLength={70}
                                            indentWidth={4}
                                        />
                                    </Card.Body>
                                </Card>
                            </Grid.Col>
                        </Grid.Row>
                        }
                    </Page.Content>
                )
                }}
            </ConnectionContext.Consumer>
        )
    }
}

export default withRouter(DIDResolver);
