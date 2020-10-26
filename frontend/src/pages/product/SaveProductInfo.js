// @flow

import * as React from "react";

import {
  Grid,
  Card,
  Button
} from "tabler-react";

import AddressInput from '../utilities/AddressInput';
import InfoInput from '../utilities/InfoInput';
import { store } from 'react-notifications-component';
import Misc from '../utilities/Misc';

class SaveProductInfo extends React.Component {

    productDIDInputRef  = React.createRef();
    infoInputRef        = React.createRef();

    constructor(props) {
        super(props)
        this.state = {
            inputValidity:{
                productDID:false,
                info:false
            }
        }
        this.initialState = this.state;
    }

    resetInputs(){
        this.productDIDInputRef.current.resetInput();
        this.infoInputRef.current.resetInput();
        this.setState(this.initialState);
    }

    onSaveButtonClicked(e){
        var productDIDInput         = this.productDIDInputRef.current;
        var infoInput               = this.infoInputRef.current;
        var productDID              = productDIDInput.state.addressInputState.value;
        var infoName                = Misc.toHex(this.props.web3, infoInput.state.inputValues.infoName);
        var infoValue               = Misc.toHex(this.props.web3, infoInput.state.inputValues.infoValue);
        Misc.getCurrentAccount(this.props.web3, (error, account) => {
            if (error){
                Misc.showAccountNotConnectedNotification(store);
            } else {
                this.props.contracts["Product"].methods["saveProductInfo"](productDID, infoName, infoValue).send({
                    from:account,
                    gas: process.env.REACT_APP_DEFAULT_GAS,
                    gasPrice: process.env.REACT_APP_GAS_PRICE
                })
                .on('transactionHash', (hash) => {
                    Misc.showTransactionHashMessage(store, hash);
                    this.resetInputs();
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    if (confirmationNumber === process.env.REACT_APP_CONFIRMATION_COUNT){
                        Misc.showTransactionConfirmed(store, receipt);
                    }
                }).on('error', (error) => {
                    console.log(error)
                    Misc.showErrorMessage(store, error.message);
                });
            }
        });
    }

    onProductDIDValidityChanged(valid){
        var inputValidity = {};
        inputValidity.productDID = valid;
        inputValidity.info = this.state.inputValidity.info;
        this.setState({inputValidity})
    }

    onInfoValidityChanged(valid){
        var inputValidity = {};
        inputValidity.info = valid;
        inputValidity.productDID = this.state.inputValidity.productDID;
        this.setState({inputValidity})
    }

    render () {
        return (
            <Grid.Row>
                <Grid.Col>
                    <Card title="Save Product Info" isCollapsible>
                        <Card.Body>
                            <AddressInput
                                        label="Product DID"
                                        showDIDMethod={true}
                                        web3={this.props.web3}
                                        onAddressValidityChanged={this.onProductDIDValidityChanged.bind(this)}
                                        ref={this.productDIDInputRef}/>
                            <InfoInput  onInfoValidityChanged={this.onInfoValidityChanged.bind(this)}
                                        ref={this.infoInputRef} />
                        </Card.Body>
                        <Card.Footer>
                            <div align="right">
                                <Button
                                    disabled={!this.state.inputValidity.productDID || !this.state.inputValidity.info}
                                    onClick={this.onSaveButtonClicked.bind(this)}
                                    color="primary">
                                        Save
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default SaveProductInfo;
