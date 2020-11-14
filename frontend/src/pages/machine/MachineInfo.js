import React from "react";
import { Link } from "react-router-dom";

import { Table, Grid, Card, Dimmer, Button } from "tabler-react";
import AddressResolver from "../utilities/AddressResolver";
import Misc from "../utilities/Misc";

class MachineInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: [],
      loading: true,
    };
  }

  getMachineInfo(machine) {
    var newState = {};
    newState.info = [];
    this.setState(newState);

    this.props.MachineContract.methods["getMachineID"]()
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var info = this.state.info;
          var fullMachineDID = "did:ethr:" + result;
          info.push({
            infoName: "Machine DID",
            infoValue: fullMachineDID,
            link: "/did-resolver/" + result,
          });
          return {
            info: info,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.props.MachineContract.methods["getMachineOwner"]()
      .call()
      .then((result) => {
        this.setState((state, props) => {
          var info = this.state.info;
          info.push({
            infoName: "Machine Owner",
            infoValue: result,
            isResolvableAddress: true,
          });
          info.push({
            infoName: "Contract Address",
            infoValue: this.props.MachineContract._address,
          });
          return {
            info: info,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.props.MachineContract.methods["getMachineInfoNames"]()
      .call()
      .then((infoNames) => {
        if (infoNames.length > 0) {
          for (let infoName of infoNames) {
            this.props.MachineContract.methods["getMachineInfo"](infoName)
              .call()
              .then((infoValue) => {
                var infoNameString = Misc.toString(this.props.web3, infoName);
                var infoValueString = Misc.toString(this.props.web3, infoValue);
                this.setState((state, props) => {
                  var info = this.state.info;
                  info.push({
                    infoName: infoNameString,
                    infoValue: infoValueString,
                  });
                  return {
                    info: info,
                  };
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
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
          <Card>
            <Dimmer active={false} loader>
              <Card.Header>
                <Card.Title>Machine Info</Card.Title>
                <Card.Options>
                  <Link
                    to={
                      "/machine/" +
                      this.props.MachineContract._address +
                      "/manage"
                    }
                  >
                    <Button
                      color="success"
                      icon="edit"
                      size="sm"
                      outline={true}
                    >
                      Manage
                    </Button>
                  </Link>
                </Card.Options>
              </Card.Header>
              <Card.Body>
                {this.state.info.length === 0 ? (
                  <div className="emptyListStatus">{"No Machine Info."}</div>
                ) : (
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColHeader>Info Name</Table.ColHeader>
                        <Table.ColHeader>Info Value</Table.ColHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {this.state.info.map((object, i) => (
                        <Table.Row key={this.state.info[i].infoName}>
                          <Table.Col>{this.state.info[i].infoName}</Table.Col>
                          {this.getValueColumn(this.state.info[i])}
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
