// @flow

import * as React from "react";

import {
  Page,
  Form,
  Grid,
  Card,
  Button
} from "tabler-react";

import NotificationSystem from 'react-notification-system';

import SiteWrapper from "../SiteWrapper.react";

class Process extends React.Component {

    notificationSystem = React.createRef();

    constructor(props) {
        super(props)
        this.state = {
            formValues:{
                supplyingProductDID: {
                    value: "",
                    invalid: false,
                    valid: false
                },
                productionProductDID: {
                    value: "",
                    invalid: false,
                    valid: false
                }
            }
        }
    }

    resetInput(inputName){
        let formValues = this.state.formValues;
        Array.from(document.querySelectorAll(`[name="${inputName}"]`)).forEach(
                input => (input.value = "")
        );
        formValues[inputName].invalid = false
        formValues[inputName].valid = false
        this.setState({formValues})
    }

    checkProductDID(productDID){
        let web3 = this.props.drizzle.web3;
        return web3.utils.isAddress(productDID)
    }

    onSupplyingProcessStartClicked(e){
        let formValues = this.state.formValues;
        let productDID = formValues["supplyingProductDID"].value;
        if (this.checkProductDID(productDID)){
            this.props.drizzle.contracts["SupplyingProcess"].methods["startSupplyingProcess"](productDID).send({
                from:this.props.drizzleState.accounts[0],
                gas: process.env.REACT_APP_DEFAULT_GAS,
                gasPrice: process.env.REACT_APP_GAS_PRICE
            }, this.sendTransactionCallback.bind(this));
        }else{
            formValues["supplyingProductDID"].invalid = true
            this.setState({formValues})
        }
    }

    sendTransactionCallback(error, transactionHash){
        const notification = this.notificationSystem.current;
        if (error){
            console.log(error)
            notification.addNotification({
                title: 'Error',
                message: error.message,
                level: 'error',
                position: 'br',
                autoDismiss: 0
            });
        }else{
            notification.addNotification({
                title: 'Process Started',
                message: 'Transaction Hash: \n' + transactionHash,
                level: 'success',
                position: 'br'
            });
            this.resetInput("productionProductDID")
            this.resetInput("supplyingProductDID")
        }
    }

    onProductionProcessStartClicked(e){
        let formValues = this.state.formValues;
        let productDID = formValues["productionProductDID"].value;
        if (this.checkProductDID(productDID)){
            this.props.drizzle.contracts["ProductionProcess"].methods["startProductionProcess"](productDID).send({
                from:this.props.drizzleState.accounts[0],
                gas: process.env.REACT_APP_DEFAULT_GAS,
                gasPrice: process.env.REACT_APP_GAS_PRICE
            }, this.sendTransactionCallback.bind(this));
        }else{
            formValues["productionProductDID"].invalid = true
            this.setState({formValues})
        }
    }

    handleChange(event) {
        let formValues = this.state.formValues;
        let name = event.target.name;
        let value = event.target.value;

        formValues[name].value = value;
        formValues[name].invalid = !this.checkProductDID(value);
        formValues[name].valid = !formValues[name].invalid;
        this.setState({formValues})
    }

    render () {
        return (
            <SiteWrapper>
                <Page.Content title="Processes">
                    <Grid.Row>
                        <Grid.Col md={12} xl={12}>
                            <Card title="Supplying Process" isCollapsible>
                                <Card.Body>
                                    <Form.Group label="Product DID">
                                        <Form.InputGroup>
                                            <Form.InputGroupPrepend>
                                                <Form.InputGroupText>did:ethr:</Form.InputGroupText>
                                            </Form.InputGroupPrepend>
                                            <Form.Input
                                                invalid={this.state.formValues.supplyingProductDID.invalid}
                                                cross={this.state.formValues.supplyingProductDID.invalid}
                                                valid={this.state.formValues.supplyingProductDID.valid}
                                                tick={this.state.formValues.supplyingProductDID.valid}
                                                name="supplyingProductDID"
                                                placeholder="Ethereum address 0x3f..."
                                                onChange={this.handleChange.bind(this)}/>
                                        </Form.InputGroup>
                                    </Form.Group>
                                </Card.Body>
                                <Card.Footer>
                                    <div align="right">
                                        <Button
                                            onClick={this.onSupplyingProcessStartClicked.bind(this)}
                                            color="primary">
                                                Start
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Grid.Col>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Col md={12} xl={12}>
                            <Card title="Production Process" isCollapsible>
                                <Card.Body>
                                    <Form.Group label="Product DID">
                                        <Form.InputGroup>
                                            <Form.InputGroupPrepend>
                                                <Form.InputGroupText>did:ethr:</Form.InputGroupText>
                                            </Form.InputGroupPrepend>
                                            <Form.Input
                                                invalid={this.state.formValues.productionProductDID.invalid}
                                                cross={this.state.formValues.productionProductDID.invalid}
                                                valid={this.state.formValues.productionProductDID.valid}
                                                tick={this.state.formValues.productionProductDID.valid}
                                                name="productionProductDID"
                                                placeholder="Ethereum address 0x3f..."
                                                onChange={this.handleChange.bind(this)}/>
                                        </Form.InputGroup>
                                    </Form.Group>
                                </Card.Body>
                                <Card.Footer>
                                    <div align="right">
                                        <Button
                                            onClick={this.onProductionProcessStartClicked.bind(this)}
                                            color="primary">
                                                Start
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Grid.Col>
                    </Grid.Row>
                </Page.Content>
                <NotificationSystem ref={this.notificationSystem} />
            </SiteWrapper>
        )
    }
}

export default Process;
