// @flow

import * as React from "react";

import {
  Page
} from "tabler-react";

import SiteWrapper from "../SiteWrapper.react";
import StartProcess from "./StartProcess";

class Process extends React.Component {

    render () {
        return (
            <SiteWrapper>
                <Page.Content title="Processes">
                    <StartProcess
                        drizzle={this.props.drizzle}
                        drizzleState={this.props.drizzleState}
                        title="Supplying Process"
                        contractName="SupplyingProcess"
                        methodName="startSupplyingProcess"
                    />
                    <StartProcess
                        drizzle={this.props.drizzle}
                        drizzleState={this.props.drizzleState}
                        title="Production Process"
                        contractName="ProductionProcess"
                        methodName="startProductionProcess"
                    />
                </Page.Content>
            </SiteWrapper>
        )
    }
}

export default Process;
