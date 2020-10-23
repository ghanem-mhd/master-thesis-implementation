import React from "react";
import { newContextComponents } from "@drizzle/react-components";
import {
  Table,
  Grid,
  Card
} from "tabler-react";

const { ContractData } = newContextComponents;

class MachineInfo extends React.PureComponent {

    state = {};

    getData(props){
        props.drizzle.contracts[props.machine].methods["getMachineInfoNames"].call().call().then( infoNames => {
            this.setState({infoNames:infoNames})

        });
    }

    componentDidMount(){
        this.getData(this.props)
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        this.getData(nextProps)
    }

    render() {
        var infoNames =  this.state.infoNames;
        return (
            <Grid.Row>
                <Grid.Col md={12} xl={12}>
                    <Card
                    title="Machine Info"
                    isCollapsible
                    isClosable
                    body={
                        infoNames && <Table>
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
                                        did:ethr:<ContractData
                                            drizzle={this.props.drizzle}
                                            drizzleState={this.props.drizzleState}
                                            contract={this.props.machine}
                                            method="machineID"
                                            methodArgs={[]}
                                        />
                                </Table.Col>
                            </Table.Row>
                            <Table.Row>
                                <Table.Col>Machine Owner</Table.Col>
                                <Table.Col>
                                        did:ethr:<ContractData
                                            drizzle={this.props.drizzle}
                                            drizzleState={this.props.drizzleState}
                                            contract={this.props.machine}
                                            method="machineOwner"
                                            methodArgs={[]}
                                        />
                                </Table.Col>
                            </Table.Row>
                            <Table.Row>
                                <Table.Col>Contract Address</Table.Col>
                                <Table.Col>
                                       {this.props.drizzle.contracts[this.props.machine].address}
                                </Table.Col>
                            </Table.Row>
                            {
                                infoNames.map((object, i) =>
                                    <Table.Row key={infoNames[i]}>
                                        <Table.Col>{this.props.drizzle.web3.utils.hexToUtf8(infoNames[i])}</Table.Col>
                                        <Table.Col>
                                            <ContractData
                                                    drizzle={this.props.drizzle}
                                                    drizzleState={this.props.drizzleState}
                                                    contract={this.props.machine}
                                                    method="getMachineInfo"
                                                    methodArgs={[infoNames[i]]}
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