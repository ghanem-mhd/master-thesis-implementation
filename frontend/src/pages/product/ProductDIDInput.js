// @flow

import * as React from "react";

import {
  Grid,
  Button
} from "tabler-react";

import AddressInput from '../utilities/AddressInput'

class ProductDIDInput extends React.Component {

    didInputRef = React.createRef();

    constructor(props) {
        super(props)
        this.state = {
            findDisabled:true
        }
    }

    onFindButtonClicked(e){
        var productDID = this.didInputRef.current.state.addressInputState.value;
        if (productDID !== null){
            this.props.onFindButtonClicked(productDID);
        }
    }

    onAddressValidityChanged(valid){
        this.setState({findDisabled:!valid})
    }

    render () {
        return (
            <Grid.Row className="justify-content-center">
                <Grid.Col sm={11}>
                    <AddressInput
                                    label=""
                                    showDIDMethod={true}
                                    web3={this.props.web3}
                                    onAddressValidityChanged={this.onAddressValidityChanged.bind(this)}
                                    ref={this.didInputRef}/>
                </Grid.Col>
                <Grid.Col sm={1}>
                    <Button disabled={this.state.findDisabled}
                            onClick={this.onFindButtonClicked.bind(this)}
                            color="primary">
                            Find
                    </Button>
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default ProductDIDInput;
