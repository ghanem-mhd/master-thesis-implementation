// @flow

import * as React from "react";

import { Page } from "tabler-react";

import ProcessInfo from "./ProcessInfo";
import StartProcess from "./StartProcess";
import ProcessStepper from "./ProcessStepper";
import ConnectionContext from "../utilities/ConnectionContext";
import Misc from "../utilities/Misc";

function getContractDynamicInfo() {
  return [
    {
      methodName: "getProcessesCount",
      infoName: "Process Instance Count",
      postfix: "Instances",
    },
    { methodName: "getProcessOwner", infoName: "Process Owner Address" },
    { methodName: "VGRContract", infoName: "VGR Machine Contract Address" },
    { methodName: "HBWContract", infoName: "HBW Machine Contract Address" },
    { methodName: "MPOContract", infoName: "MPO Machine Contract Address" },
    { methodName: "SLDContract", infoName: "SLD Machine Contract Address" },
  ];
}

class ProductionProcess extends React.Component {
  componentDidMount() {
    document.title = "Production Process";
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          this.contract = connectionContext.contracts["ProductionProcess"];
          var staticInfo = [
            { infoName: "Contract Address", infoValue: this.contract._address },
            { infoName: "Number of Machines", infoValue: "4 Machines" },
            { infoName: "Number of Steps", infoValue: "5 Steps" },
          ];
          return (
            <Page.Content title="Production Process">
              <ProcessStepper
                title="Process Steps"
                steps={Misc.getProductionSteps()}
                activeStep={-1}
              />
              <ProcessInfo
                dynamicInfo={getContractDynamicInfo()}
                staticInfo={staticInfo}
                contract={this.contract}
              />
              <StartProcess
                web3={this.web3}
                contract={this.contract}
                methodName="startProductionProcess"
              />
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default ProductionProcess;
