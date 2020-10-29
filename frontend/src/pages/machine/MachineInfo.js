import React from "react";
import {
  Table,
  Grid,
  Card,
  Dimmer
} from "tabler-react";
import Misc from '../utilities/Misc';

class MachineInfo extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        info: [],
        loading: true
      }
    }

    getMachineInfo(machine){
        var MachineContract   = this.props.contracts[machine];

        var newState = {};
        newState.info = []
        this.setState(newState);

        MachineContract.methods["getMachineID"]().call().then( result => {
            this.setState( (state, props) => {
                var info = this.state.info;
                var fullMachineDID = "did:ethr:" + result;
                info.push({infoName:"Machine DID", infoValue:fullMachineDID});
                return {
                    info: info
                };
            });
        }).catch( error => {
            console.log(error);
        });

        MachineContract.methods["getMachineOwner"]().call().then( result => {
            this.setState( (state, props) => {
                var info = this.state.info;
                info.push({infoName:"Machine Owner", infoValue:result});
                info.push({infoName:"Contract Address", infoValue:MachineContract._address});
                return {
                    info: info
                };
            });
        }).catch( error => {
            console.log(error);
        });

        MachineContract.methods["getMachineInfoNames"]().call().then( infoNames => {
            if (infoNames.length > 0){
                for (let infoName of infoNames){
                    MachineContract.methods["getMachineInfo"](infoName).call().then( infoValue => {
                        var infoNameString  = Misc.toString(this.props.web3, infoName);
                        var infoValueString = Misc.toString(this.props.web3, infoValue);
                        this.setState( (state, props) => {
                            var info = this.state.info;
                            info.push({infoName:infoNameString, infoValue:infoValueString});
                            return {
                                info: info
                            };
                        });
                    }).catch( error => {
                        console.log(error);
                    });
                }
            }
        }).catch( error => {
            console.log(error);
        });

    }

    componentDidMount(){
        this.getMachineInfo(this.props.machine)
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if (this.props.machine !== nextProps.machine){
            this.getMachineInfo(nextProps.machine);
        }
    }

    render() {
        return (
            <Grid.Row>
                <Grid.Col>
                    <Card title="Machine Info" isCollapsible>
                        <Dimmer active={false} loader>
                            <Card.Body>
                                {this.state.info.length === 0
                                ? <div className="emptyListStatus">{"No Machine Info."}</div>
                                :<Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.ColHeader>Info Name</Table.ColHeader>
                                            <Table.ColHeader>Info Value</Table.ColHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                    {
                                        this.state.info.map((object, i) =>
                                            <Table.Row key={this.state.info[i].infoName}>
                                                <Table.Col>{this.state.info[i].infoName}</Table.Col>
                                                <Table.Col>{this.state.info[i].infoValue}</Table.Col>
                                            </Table.Row>
                                        )
                                    }
                                    </Table.Body>
                                </Table>
                                }
                            </Card.Body>
                        </Dimmer>
                    </Card>
                </Grid.Col>
            </Grid.Row>
        )
    }
}

export default MachineInfo;