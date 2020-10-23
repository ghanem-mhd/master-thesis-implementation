// @flow

import * as React from "react";

import {
  Page,
  Form
} from "tabler-react";

import SiteWrapper from "./SiteWrapper.react";
import Machine from "./machine/Machine"

class Home extends React.Component {

  state = {machine:"VGR"}

  constructor(props) {
    super(props);
    this.machineComponent = React.createRef();
  }

  handleChange(e){
    this.setState({machine:e.target.value})
  }


  render () {
    return (
      <SiteWrapper>
        <Page.Content title="Machine Digital Twin">
          <Form.Group>
            <Form.Select onChange={this.handleChange.bind(this)}>
            <option>VGR</option>
            <option>HBW</option>
            <option>MPO</option>
            <option>SLD</option>
            </Form.Select>
          </Form.Group>
          <Machine drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.state.machine}/>
        </Page.Content>
      </SiteWrapper>
    )
  }
}

export default Home;
