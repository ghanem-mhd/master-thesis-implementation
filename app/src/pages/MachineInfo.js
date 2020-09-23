import React from "react";
import { newContextComponents } from "@drizzle/react-components";
import {
  Table,
  Grid,
  Card
} from "tabler-react";

const { AccountData, ContractData, ContractForm } = newContextComponents;

class MachineInfo extends React.PureComponent {

    state = {};

    constructor(props){
        super(props);
    }
    componentDidUpdate(){
        var machine = this.props.machine
        let dataKey4 = this.props.drizzle.contracts[machine].methods["getMachineInfoNames"].cacheCall();
        this.setState({dataKey4:dataKey4});
    }

    render() {
        var machine = this.props.machine
        const contract  = this.props.drizzleState.contracts[machine];
        const infoNames = contract.getMachineInfoNames[this.state.dataKey4];
        return (
            <Grid.Row>
                <Grid.Col md={12} xl={12}>
                    <Card
                    title="Machine Info"
                    isCollapsible
                    isClosable
                    body={
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColHeader>Info Name</Table.ColHeader>
                                    <Table.ColHeader>Info Value</Table.ColHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                            <Table.Row>
                                <Table.Col>Machine ID</Table.Col>
                                <Table.Col>
                                        <ContractData
                                            drizzle={this.props.drizzle}
                                            drizzleState={this.props.drizzleState}
                                            contract={machine}
                                            method="machineID"
                                            methodArgs={[]}
                                        />
                                </Table.Col>
                            </Table.Row>
                            <Table.Row>
                                <Table.Col>Machine Owner</Table.Col>
                                <Table.Col>
                                        <ContractData
                                            drizzle={this.props.drizzle}
                                            drizzleState={this.props.drizzleState}
                                            contract={machine}
                                            method="machineOwner"
                                            methodArgs={[]}
                                        />
                                </Table.Col>
                            </Table.Row>
                            {
                                infoNames && infoNames.value &&
                                infoNames.value.map((object, i) =>
                                    <Table.Row key={infoNames.value[i]}>
                                        <Table.Col>{this.props.drizzle.web3.utils.hexToUtf8(infoNames.value[i])}</Table.Col>
                                        <Table.Col>
                                            <ContractData
                                                    drizzle={this.props.drizzle}
                                                    drizzleState={this.props.drizzleState}
                                                    contract={machine}
                                                    method="getMachineInfo"
                                                    methodArgs={[infoNames.value[i]]}
                                                    toUtf8
                                                />
                                        </Table.Col>
                                    </Table.Row>
                                )
                            }
                            </Table.Body>
                        </Table>
                    }
                    />
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default MachineInfo;