// @flow

import * as React from "react";
import { withRouter } from "react-router";

import {
  Page
} from "tabler-react";


import ConnectionContext from '../utilities/ConnectionContext';
import AuthorizeParty from './AuthorizeParty';
import SaveMachineInfo from './SaveMachineInfo';
import RequestReading from './RequestReading';
import SaveMaintenanceOperation from './SaveMaintenanceOperation';


class ManageMachine extends React.Component {

    render () {
        return (
            <ConnectionContext.Consumer>
                {(connectionContext) => {
                const { web3, contracts } = connectionContext;
                return (
                    <Page.Content title={"Manage " + this.props.match.params.machine}>
                        <AuthorizeParty web3={web3} contracts={contracts} machine={this.props.match.params.machine}/>
                        <SaveMachineInfo web3={web3} contracts={contracts} machine={this.props.match.params.machine}/>
                        <RequestReading  web3={web3} contracts={contracts} machine={this.props.match.params.machine}/>
                        <SaveMaintenanceOperation web3={web3} contracts={contracts} machine={this.props.match.params.machine}/>
                    </Page.Content>
                    )
                }}
            </ConnectionContext.Consumer>
        )
    }
}

export default withRouter(ManageMachine);
