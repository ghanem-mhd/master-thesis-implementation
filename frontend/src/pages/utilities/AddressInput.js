// @flow

import * as React from "react";

import {
  Form
} from "tabler-react";

class AddressInput extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            addressInputState: {
                value: null,
                invalid: false,
                valid: false,
                feedback: ""
            }
        }
        this.initialState = this.state;
    }

    resetInput(){
        Array.from(document.querySelectorAll(`[name=address]`)).forEach(
                input => (input.value = "")
        );
        this.setState(this.initialState)
    }

    checkInput(address){
        var web3 = this.props.web3;
        if (web3 !== undefined){
            if (web3.utils.isAddress(address)){
                return null;
            }else{
                return "Invalid ethereum address";
            }
        }else{
            return "Check the network connection";
        }
    }

    handleChange(event) {
        let addressInputState = {};
        let value = event.target.value;
        var errorMessage = this.checkInput(value);
        if (errorMessage){
            this.props.onAddressValidityChanged(false)
            addressInputState.invalid = true;
            addressInputState.feedback = errorMessage;
            addressInputState.value=null
        }else{
            this.props.onAddressValidityChanged(true)
            addressInputState.invalid = false;
            addressInputState.feedback = "";
            addressInputState.value = value
        }
        addressInputState.valid = !addressInputState.invalid;
        this.setState({addressInputState})
    }

    render () {
        return (
            <Form.Group label={this.props.label}>
                <Form.InputGroup>
                    {
                        this.props.showDIDMethod &&
                        <Form.InputGroupPrepend>
                            <Form.InputGroupText>did:ethr:</Form.InputGroupText>
                        </Form.InputGroupPrepend>
                    }
                    <Form.Input
                        invalid={this.state.addressInputState.invalid}
                        cross={this.state.addressInputState.invalid}
                        valid={this.state.addressInputState.valid}
                        tick={this.state.addressInputState.valid}
                        name="address"
                        placeholder="Ethereum address 0x3f..."
                        feedback={this.state.addressInputState.feedback}
                        onChange={this.handleChange.bind(this)}/>
                </Form.InputGroup>
            </Form.Group>
        )
    }
}

export default AddressInput;
