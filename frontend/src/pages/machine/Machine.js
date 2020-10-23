// @flow

import * as React from "react";

import MachineInfo from "./MachineInfo";
import MachineMetrics from "./MachineMetrics";
import AuthorizedParties from "./AuthorizedParties";

class Machine extends React.Component {

    state = {machine:null};

    render() {
        return (
          <div>
              <MachineMetrics drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.props.machine} />
              <MachineInfo drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.props.machine} />
              <AuthorizedParties drizzle={this.props.drizzle} drizzleState={this.props.drizzleState} machine={this.props.machine} methodName={"getAuthorizedManufacturers"} name={"Manufacturers"}/>
          </div>
        );
    }
}

export default Machine;
