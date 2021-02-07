import React from "react";
import { Link } from "react-router-dom";
import { Table, Grid, Card, Dimmer } from "tabler-react";
import AddressResolver from "../utilities/AddressResolver";
import Misc from "../utilities/Misc";

class MachineInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infoData: [],
      loading: true,
    };
  }

  async getMachineInfo(machine) {
    try {
      var infoData = [];
      var machineDID = await this.props.MachineContract.methods[
        "getMachineDID"
      ]().call();
      infoData.push({
        infoName: "Machine DID",
        infoValue: "did:ethr:" + machineDID,
        link: "/did-resolver/" + machineDID,
      });
      var machineOwner = await this.props.MachineContract.methods[
        "getMachineOwner"
      ]().call();
      infoData.push({
        infoName: "Machine Owner",
        infoValue: machineOwner,
        isResolvableAddress: true,
      });
      infoData.push({
        infoName: "Contract Address",
        infoValue: this.props.MachineContract._address,
      });
      var infoNames = await this.props.MachineContract.methods[
        "getMachineInfoNames"
      ]().call();
      if (infoNames.length > 0) {
        for (let infoName of infoNames) {
          let infoValue = await this.props.MachineContract.methods[
            "getMachineInfo"
          ](infoName);
          var infoNameString = Misc.toString(this.props.web3, infoName);
          var infoValueString = Misc.toString(this.props.web3, infoValue);
          infoData.push({
            infoName: infoNameString,
            infoValue: infoValueString,
          });
        }
      }
      this.setState((state, props) => {
        return {
          infoData: infoData,
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount() {
    this.getMachineInfo();
  }

  getValueColumn(info) {
    if (info.link) {
      return (
        <Table.Col>
          <Link to={info.link} target="_blank">
            {info.infoValue}
          </Link>
        </Table.Col>
      );
    }
    if (info.isResolvableAddress) {
      return (
        <Table.Col>
          <AddressResolver address={info.infoValue} />
        </Table.Col>
      );
    }
    return <Table.Col>{info.infoValue}</Table.Col>;
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Machine Info" isFullscreenable isClosable isCollapsible>
            <Dimmer active={false} loader>
              <Card.Body>
                {this.state.infoData.length === 0 ? (
                  <div className="emptyListStatus">{"No Machine Info."}</div>
                ) : (
                  <Table className="table-vcenter">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColHeader>Info Name</Table.ColHeader>
                        <Table.ColHeader>Info Value</Table.ColHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {this.state.infoData.map((object, i) => (
                        <Table.Row key={this.state.infoData[i].infoName}>
                          <Table.Col>
                            {this.state.infoData[i].infoName}
                          </Table.Col>
                          {this.getValueColumn(this.state.infoData[i])}
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </Card.Body>
            </Dimmer>
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default MachineInfo;
