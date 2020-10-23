// @flow

import * as React from "react";

import {
  Form,
  Grid,
  Card,
  Button
} from "tabler-react";

import NotificationSystem from 'react-notification-system';

class StartProcess extends React.Component {

    notificationSystem = React.createRef();

    constructor(props) {
        super(props)
        this.state = {
            formValues:{
                productDID: {
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

    onStartClicked(e){
        let formValues = this.state.formValues;
        let productDID = formValues["productDID"].value;
        if (this.checkProductDID(productDID)){
            this.props.drizzle.contracts[this.props.contractName.toString()].methods[this.props.methodName.toString()](productDID).send({
                from:this.props.drizzleState.accounts[0],
                gas: process.env.REACT_APP_DEFAULT_GAS,
                gasPrice: process.env.REACT_APP_GAS_PRICE
            }, this.sendTransactionCallback.bind(this));
        }else{
            formValues["productDID"].invalid = true
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
            this.resetInput("productDID")
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
            <Grid.Row>
                <Grid.Col md={12} xl={12}>
                    <Card title={this.props.title} isCollapsible>
                        <Card.Body>
                            <Form.Group label="Product DID">
                                <Form.InputGroup>
                                    <Form.InputGroupPrepend>
                                        <Form.InputGroupText>did:ethr:</Form.InputGroupText>
                                    </Form.InputGroupPrepend>
                                    <Form.Input
                                        invalid={this.state.formValues.productDID.invalid}
                                        cross={this.state.formValues.productDID.invalid}
                                        valid={this.state.formValues.productDID.valid}
                                        tick={this.state.formValues.productDID.valid}
                                        name="productDID"
                                        placeholder="Ethereum address 0x3f..."
                                        onChange={this.handleChange.bind(this)}/>
                                </Form.InputGroup>
                            </Form.Group>
                        </Card.Body>
                        <Card.Footer>
                            <div align="right">
                                <Button
                                    onClick={this.onStartClicked.bind(this)}
                                    color="primary">
                                        Start
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

export default StartProcess;
