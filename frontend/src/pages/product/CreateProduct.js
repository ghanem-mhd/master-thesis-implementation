// @flow

import * as React from "react";

import {
  Form,
  Grid,
  Card,
  Button
} from "tabler-react";

import NotificationSystem from 'react-notification-system';

class CreateProduct extends React.Component {

    notificationSystem = React.createRef();

    constructor(props) {
        super(props)
        this.state = {
            formValues:{
                createProductInput1: {
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
            this.resetInput("createProductInput1")
            this.resetInput("authorizeManufacturerInput1")
            this.resetInput("authorizeManufacturerInput2")
        }
    }

    checkProductDID(productDID){
        let web3 = this.props.drizzle.web3;
        return web3.utils.isAddress(productDID)
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

    onCreateButtonClicked(e){
        let formValues = this.state.formValues;
        let productDID = formValues["createProductInput1"].value;
        if (this.checkProductDID(productDID)){
            this.props.drizzle.contracts["Product"].methods["createProduct"](productDID).send({
                from:this.props.drizzleState.accounts[0],
                gas: process.env.REACT_APP_DEFAULT_GAS,
                gasPrice: process.env.REACT_APP_GAS_PRICE
            }, this.sendTransactionCallback.bind(this));
        }else{
            formValues["createProductInput1"].invalid = true
            this.setState({formValues})
        }
    }

    render () {
        return (
            <Grid.Row>
                <Grid.Col md={12} xl={12}>
                    <Card title="Create New Product" isCollapsible>
                        <Card.Body>
                            <Form.Group label="Product DID">
                                <Form.InputGroup>
                                    <Form.InputGroupPrepend>
                                        <Form.InputGroupText>did:ethr:</Form.InputGroupText>
                                    </Form.InputGroupPrepend>
                                    <Form.Input
                                        invalid={this.state.formValues.createProductInput1.invalid}
                                        cross={this.state.formValues.createProductInput1.invalid}
                                        valid={this.state.formValues.createProductInput1.valid}
                                        tick={this.state.formValues.createProductInput1.valid}
                                        name="createProductInput1"
                                        placeholder="Product ethereum address 0x3f..."
                                        onChange={this.handleChange.bind(this)}/>
                                </Form.InputGroup>
                            </Form.Group>
                        </Card.Body>
                        <Card.Footer>
                            <div align="right">
                                <Button
                                    onClick={this.onCreateButtonClicked.bind(this)}
                                    color="primary">
                                        Create
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Grid.Col>
                <NotificationSystem ref={this.notificationSystem} />
            </Grid.Row>
        )
    }
}

export default CreateProduct;
