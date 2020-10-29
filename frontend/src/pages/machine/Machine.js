// @flow

import * as React from "react";
import { Link } from "react-router-dom";
import {
  Page,
  Form,
  Grid,
  Button
} from "tabler-react";

import ConnectionContext from '../utilities/ConnectionContext';
import MachineInfo from "./MachineInfo";
import MachineMetrics from "./MachineMetrics";
import AuthorizedParties from "./AuthorizedParties";

class Machine extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        machine: "VGR"
      }
    }

    handleChange(e){
        this.setState({machine:e.target.value})
    }

    render() {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                this.web3       = connectionContext.web3;
                this.contracts  = connectionContext.contracts;
                return (
                    <Page.Content title={this.state.machine + " Machine Digital Twin"}>
                        <Grid.Row className="justify-content-center">
                            <Grid.Col width={10}>
                                <Form.Group>
                                    <Form.Select onChange={this.handleChange.bind(this)}>
                                    <option value="VGR">Vacuum Gripper Robot</option>
                                    <option value="HBW">High-Bay Warehouse</option>
                                    <option value="MPO">Multi-Processing Station with Oven</option>
                                    <option value="SLD">Sorting Line with Color Detection</option>
                                    </Form.Select>
                                </Form.Group>
                            </Grid.Col>
                            <Grid.Col width={2}>
                                <Link to={"/" + this.state.machine + "/manage"}>
                                    <Button color="success" icon="edit">Manage</Button>
                                </Link>
                            </Grid.Col>
                        </Grid.Row>
                        <MachineMetrics contracts={this.contracts} machine={this.state.machine} />
                        <MachineInfo contracts={this.contracts} machine={this.state.machine} web3={this.web3}/>
                        <AuthorizedParties contracts={this.contracts} machine={this.state.machine} web3={this.web3} />
                    </Page.Content>
                    )
                }}
            </ConnectionContext.Consumer>
        )
    }
}

export default Machine;
