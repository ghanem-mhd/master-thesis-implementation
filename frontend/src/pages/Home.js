// @flow

import * as React from "react";

import {
  Page,
  Form
} from "tabler-react";

import SiteWrapper from "./SiteWrapper.react";
import Machine from "./machine/Machine";
import Misc from './utilities/Misc';
import ConnectionContext from './utilities/ConnectionContext';

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
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          const { provider, web3, contracts } = connectionContext;
          return (
            <SiteWrapper provider={provider}>
              <Page.Content title="Machine Digital Twin">
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
        }}
      </ConnectionContext.Consumer>
    )
  }
}

export default Home;
