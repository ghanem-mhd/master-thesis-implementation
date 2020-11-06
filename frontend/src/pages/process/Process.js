// @flow

import * as React from "react";

import { Page } from "tabler-react";

import StartProcess from "./StartProcess";

class Process extends React.Component {
  componentDidMount() {
    document.title = "Processes";
  }

  render() {
    return (
      <Page.Content title="Processes">
        <StartProcess
          title="Supplying Process"
          contractName="SupplyingProcess"
          methodName="startSupplyingProcess"
        />
        <StartProcess
          title="Production Process"
          contractName="ProductionProcess"
          methodName="startProductionProcess"
        />
      </Page.Content>
    );
  }
}

export default Process;
