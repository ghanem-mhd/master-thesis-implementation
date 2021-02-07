import React from "react";
import { Link } from "react-router-dom";
import AddressResolver from "../utilities/AddressResolver";
import { Table, Grid, Card, Dimmer } from "tabler-react";

function getContractDynamicInfo() {
  return [
    {
      methodName: "getProcessOwner",
      infoName: "Process Owner",
      postfix: "",
    },
    {
      methodName: "getProcessesCount",
      infoName: "Process Instance Count",
      postfix: "Instances",
    },
    {
      methodName: "getNumberOfMachines",
      infoName: "Number of Machines",
      postfix: "Machines",
    },
    {
      methodName: "getNumberOfSteps",
      infoName: "Number of Steps",
      postfix: "Steps",
    },
  ];
}

class ProcessInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: [],
      loading: true,
    };
  }

  getProcessInfo() {
    getContractDynamicInfo().forEach((element) => {
      this.props.ProcessContract.methods[element.methodName]()
        .call()
        .then((result) => {
          var newInfo = {};
          if (element.methodName === "getProcessesCount") {
            newInfo.link =
              "/process/" + this.props.ProcessContract._address + "/instances";
          }
          if (element.methodName === "getProcessOwner") {
            newInfo.address = result;
          }
          newInfo.infoName = element.infoName;
          if (element.postfix) {
            newInfo.infoValue = result + " " + element.postfix;
          } else {
            newInfo.infoValue = result;
          }
          this.setState((state, props) => {
            return {
              info: [...this.state.info, newInfo],
            };
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  componentDidMount() {
    this.getProcessInfo();
  }

  getInfoValueElement(info) {
    if (info.address) {
      return (
        <Table.Col alignContent="center">
          <AddressResolver address={info.address} />{" "}
        </Table.Col>
      );
    }
    if (info.link) {
      return (
        <Table.Col alignContent="center">
          <Link to={info.link}>{info.infoValue}</Link>
        </Table.Col>
      );
    }
    return <Table.Col alignContent="center">{info.infoValue}</Table.Col>;
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title="Process Info" isFullscreenable isClosable isCollapsible>
            <Dimmer active={false} loader>
              <Card.Body>
                {this.state.info.length === 0 ? (
                  <div className="emptyListStatus">{"No Process Info."}</div>
                ) : (
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColHeader>Info Name</Table.ColHeader>
                        <Table.ColHeader alignContent="center">
                          Info Value
                        </Table.ColHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {this.state.info.map((object, i) => (
                        <Table.Row key={this.state.info[i].infoName}>
                          <Table.Col>{this.state.info[i].infoName}</Table.Col>
                          {this.getInfoValueElement(this.state.info[i])}
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

export default ProcessInfo;
