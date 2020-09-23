// @flow

import * as React from "react";
import { Page } from "tabler-react";

import MachineInfo from "./MachineInfo";
import MachineMetrics from "./MachineMetrics";
import MachineTasks from "./MachineTasks";
import SiteWrapper from "./SiteWrapper.react";

import { withRouter } from "react-router";

class Machine extends React.Component {

    state = {};

    constructor(props) {
      super(props);
    }

    render() {
        return (
          <SiteWrapper>
            <Page.Content title={this.props.match.params.machine + " Digital Twin"}>
              <MachineMetrics drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.props.match.params.machine} />
              <MachineInfo drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.props.match.params.machine} />
              <MachineTasks drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.props.match.params.machine} />
            </Page.Content>
          </SiteWrapper>
        );
    }
}

export default withRouter(Machine);
