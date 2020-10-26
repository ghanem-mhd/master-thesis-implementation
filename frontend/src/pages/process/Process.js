// @flow

import * as React from "react";

import {
  Page
} from "tabler-react";

import SiteWrapper from "../SiteWrapper.react";
import StartProcess from "./StartProcess";
import ConnectionContext from '../utilities/ConnectionContext';

class Process extends React.Component {
    render () {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                const { provider, web3, contracts } = connectionContext;
                return (
                    <SiteWrapper provider={provider}>
                        <Page.Content title="Processes">
                            <StartProcess
                                contracts={contracts}
                                web3={web3}
                                title="Supplying Process"
                                contractName="SupplyingProcess"
                                methodName="startSupplyingProcess"/>
                            <StartProcess
                                contracts={contracts}
                                web3={web3}
                                title="Production Process"
                                contractName="ProductionProcess"
                                methodName="startProductionProcess"/>
                        </Page.Content>
                    </SiteWrapper>
                    )
                }}
            </ConnectionContext.Consumer>
        )
    }
}

export default Process;
