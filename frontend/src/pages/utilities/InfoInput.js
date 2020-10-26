// @flow

import * as React from "react";

import {
  Form,
  Grid
} from "tabler-react";

class InfoInput extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputValues:{
                infoName: "",
                infoValue: ""
            }
        }
    }

    resetInput(){
        Array.from(document.querySelectorAll(`[name=infoName]`)).forEach(
                input => (input.value = "")
        );
        Array.from(document.querySelectorAll(`[name=infoValue]`)).forEach(
                input => (input.value = "")
        );
        this.setState({inputValues:{ infoName: "", infoValue: ""}})
    }

    checkInput(){
        if (this.state.inputValues.infoName !== "" && this.state.inputValues.infoValue !==""){
            this.props.onInfoValidityChanged(true)
        }else{
            this.props.onInfoValidityChanged(false)
        }
    }

    handleChange(event) {
        var inputValues     = this.state.inputValues;
        let value           = event.target.value.trim();
        let name            = event.target.name;
        inputValues[name]   = value;
        this.setState({inputValues});
        this.checkInput();
    }

    render () {
        return (
            <Grid.Row>
                <Grid.Col sm={6}>
                        <Form.Group label="Info Name">
                        <Form.Input placeholder="Text..." name="infoName" onChange={this.handleChange.bind(this)}/>
                    </Form.Group>
                </Grid.Col>
                <Grid.Col sm={6}>
                        <Form.Group label="Info Value">
                        <Form.Input placeholder="Text..." name="infoValue" onChange={this.handleChange.bind(this)} />
                    </Form.Group>
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default InfoInput;
