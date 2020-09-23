// @flow

import * as React from "react";

import {
  Page,
  Form
} from "tabler-react";

import SiteWrapper from "./SiteWrapper.react";

class Home extends React.Component {

  updateMachine(machine){
    console.log(machine)
  }

  handleChange(e){
    this.updateMachine(e.target.value)
  }

  componentDidMount(){
     this.updateMachine("VGR")
  }

  render () {
    return (
      <SiteWrapper>
        <Page.Content title="Dashboard">
          <Form.Group>
            <Form.Select onChange={this.handleChange.bind(this)}>
            <option>VGR</option>
            <option>HBW</option>
            <option>MPO</option>
            <option>SLD</option>
            </Form.Select>
          </Form.Group>
        </Page.Content>
      </SiteWrapper>
    )
  }
}

export default Home;
