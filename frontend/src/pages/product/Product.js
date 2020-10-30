// @flow

import * as React from "react";

import {
  Page,
  Grid,
  Card,
  Table,
  Alert
} from "tabler-react";

import ConnectionContext from '../utilities/ConnectionContext';
import ProductDIDInput from './ProductDIDInput';
import Misc from '../utilities/Misc';

class Product extends React.Component {

    componentDidMount(){
        document.title = "Products";
        //this.initiateGetProductData('0xbc437717e7bfc77fbd26d94ef9fc3901291e2482');
    }

    showErrorMessage(message){
        const notification = this.notificationSystem.current;
        notification.addNotification({
            title: 'Error',
            message: message,
            level: 'error',
            position: 'br',
            autoDismiss: 5
        });
    }

    getOperationObject(operationResult){
        var operation       = {};
        operation.machine   = operationResult[0];
        operation.taskID    = operationResult[1];
        operation.time      = Misc.formatTimestamp(operationResult[2]);
        operation.name      = operationResult[3];
        operation.result    = operationResult[4];
        return operation;
    }


    getProductData(productDID){
        var ProductContract = this.contracts["Product"];
        ProductContract.methods["getAuthorizeManufacturer"](productDID).call().then( result => {
            this.setState( (state, props) => {
                var product = this.state.product;
                product.info.push({infoName:"Authorized Manufacturer", infoValue:result});
                return {
                    product: product
                };
            });
        }).catch( error => {
            console.log(error);
        });

        ProductContract.methods["getProductCreationTime"](productDID).call().then( result => {
            this.setState( (state, props) => {
                var product = this.state.product;
                product.info.push({infoName:"Created At", infoValue: Misc.formatTimestamp(result)});
                return {
                    product: product
                };
            });
        }).catch( error => {
            console.log(error);
        });

        ProductContract.methods["getProductInfoNames"](productDID).call().then( infoNames => {
            if (infoNames.length > 0){
                for (let infoName of infoNames){
                    ProductContract.methods["getProductInfo"](productDID, infoName).call().then( infoValue => {
                        var infoNameString = Misc.toString(this.web3, infoName);
                        var infoValueString = Misc.toString(this.web3, infoValue);
                        this.setState( (state, props) => {
                            var product = this.state.product;
                            product.info.push({infoName:infoNameString, infoValue:infoValueString});
                            return {
                                product: product
                            };
                        });
                    }).catch( error => {
                        console.log(error);
                    });
                }
            }
        }).catch( error => {
            console.log(error);
        });

        ProductContract.methods["getProductOperations"](productDID).call().then( operationsIDSList => {
            if (operationsIDSList.length > 0){
                for (const operationID of operationsIDSList){
                    ProductContract.methods["getProductOperation"](operationID).call().then( operationResult => {
                        var operation = this.getOperationObject(operationResult);
                        operation.ID = operationID;
                        this.setState( (state, props) => {
                            var product = this.state.product;
                            product.operations.push(operation);
                            return {
                                product: product
                            };
                        });
                    }).catch( error => {
                        console.log(error);
                    });
                }
            }
        }).catch( error => {
            console.log(error);
        });
    }

    initiateGetProductData(productDID){
        var ProductContract = this.contracts["Product"];
        ProductContract.methods["getProductOwner"](productDID).call().then( result => {
            var newState                    = {};
            newState.error                  = null;
            newState.product                = {};
            newState.product.info           = [];
            newState.product.operations     = [];

            var fullProductDID = "did:ethr:" + productDID;
            newState.product.info.push({infoName:"Product DID", infoValue:fullProductDID});
            newState.product.info.push({infoName:"Product Owner", infoValue:result});
            this.setState(newState);
            this.getProductData(productDID);
        }).catch( error => {
            console.log(error);
            if (error.message.includes("Product doesn't exist.")){
                this.setState({error:`Product did:ethr:${productDID} doesn't exist.`, product:null});
            }
        });
    }

    render () {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                this.web3       = connectionContext.web3;
                this.contracts  = connectionContext.contracts;
                return (
                    <Page.Content title="Product Digital Twin"  >
                        <ProductDIDInput onFindButtonClicked={this.initiateGetProductData.bind(this)} web3={this.web3}/>
                        {this.state && this.state.error &&
                                <Grid.Row className="justify-content-center">
                                    <Grid.Col sm={12} lg={6}>
                                        <Alert type="danger">{this.state.error}</Alert>
                                    </Grid.Col>
                                </Grid.Row>
                        }
                        {this.state && this.state.product && this.state.product.info &&
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
                                                {
                                                    this.state.product.info.map((object, i) =>
                                                        <Table.Row key={this.state.product.info[i].infoName}>
                                                            <Table.Col>{this.state.product.info[i].infoName}</Table.Col>
                                                            <Table.Col>{this.state.product.info[i].infoValue}</Table.Col>
                                                        </Table.Row>
                                                    )
                                                }
                                                </Table.Body>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Grid.Col>
                            </Grid.Row>
                        }
                        {this.state && this.state.product && this.state.product.operations &&
                            <Grid.Row>
                                <Grid.Col>
                                    <Card title="Product Operations" isCollapsible isFullscreenable>
                                        <Card.Body>
                                            {this.state.operations && this.state.operations !== 0
                                            ? <Table>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.ColHeader>ID</Table.ColHeader>
                                                        <Table.ColHeader>Name</Table.ColHeader>
                                                        <Table.ColHeader>Result</Table.ColHeader>
                                                        <Table.ColHeader>Time</Table.ColHeader>
                                                        <Table.ColHeader>Machine ID</Table.ColHeader>
                                                        <Table.ColHeader>Task ID</Table.ColHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                {
                                                    this.state.product.operations.map((object, i) =>
                                                        <Table.Row key={this.state.product.operations.ID}>
                                                            <Table.Col>{this.state.product.operations[i].ID}</Table.Col>
                                                            <Table.Col>{this.state.product.operations[i].name}</Table.Col>
                                                            <Table.Col>{this.state.product.operations[i].result}</Table.Col>
                                                            <Table.Col>{this.state.product.operations[i].time}</Table.Col>
                                                            <Table.Col>{this.state.product.operations[i].machine}</Table.Col>
                                                            <Table.Col>{this.state.product.operations[i].taskID}</Table.Col>
                                                        </Table.Row>
                                                    )
                                                }
                                                </Table.Body>
                                            </Table>
                                            :<div className="emptyListStatus">{"No Product Operations."}</div>
                                            }
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

export default Product;
