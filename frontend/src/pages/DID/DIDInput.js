// @flow

import * as React from "react";

import {
  Grid,
  Button
} from "tabler-react";

import AddressInput from '../utilities/AddressInput'

class DIDInput extends React.Component {

    didInputRef = React.createRef();

    constructor(props) {
        super(props)
        this.state = {
            buttonDisabled:true
        }
    }

    onButtonClicked(e){
        var productDID = this.didInputRef.current.state.addressInputState.value;
        if (productDID !== null){
            this.props.onButtonClicked(productDID);
        }
    }

    onAddressValidityChanged(valid){
        this.setState({buttonDisabled:!valid})
    }

    render () {
        return (
            <Grid.Row className="justify-content-center">
                <Grid.Col sm={11}>
                    <AddressInput
                                    label=""
                                    showDIDMethod={true}
                                    web3={this.props.web3}
                                    value={this.props.value}
                                    onAddressValidityChanged={this.onAddressValidityChanged.bind(this)}
                                    ref={this.didInputRef}/>
                </Grid.Col>
                <Grid.Col sm={1}>
                    <Button disabled={this.state.buttonDisabled}
                            onClick={this.onButtonClicked.bind(this)}
                            color="primary">
                            Resolve
                    </Button>
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default DIDInput;
