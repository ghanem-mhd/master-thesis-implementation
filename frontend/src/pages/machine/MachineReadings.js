import React from "react";

import { withRouter } from "react-router";

import { Table, Grid, Card, Page, Button, Dimmer } from "tabler-react";
import Misc from "../utilities/Misc";
import ConnectionContext from "../utilities/ConnectionContext";
import ContractsLoader from "../utilities/ContractsLoader";
import AddressResolver from "../utilities/AddressResolver";
import ErrorPage from "../utilities/ErrorPage";

class MachineReadings extends React.Component {
  ReadingsType = {
    0: "Temperature",
    1: "Humidity",
    2: "Air Pressure",
    3: "Gas Resistance",
    4: "Brightness",
  };

  constructor(props) {
    super(props);
    this.state = {
      readings: [],
      loading: true,
    };
  }

  getReadingObject(ReadingResult) {
    var reading = {};
    reading.time = Misc.formatTimestamp(ReadingResult[0]);
    reading.type = ReadingResult[1];
    reading.value = ReadingResult[2];
    reading.taskID = ReadingResult[3];
    return reading;
  }

  getMachineReadings(MachineContract) {
    MachineContract.methods["getReadingsCount"]()
      .call()
      .then((readingsCount) => {
        this.setState({ loading: false });
        for (let readingID = 1; readingID <= readingsCount; readingID++) {
          MachineContract.methods["getReading"](readingID)
            .call()
            .then((readingResult) => {
              var reading = this.getReadingObject(readingResult);
              reading.ID = readingID;
              this.setState((state, props) => {
                return {
                  readings: [...this.state.readings, reading],
                };
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidMount() {
    document.title = "Machine Readings";
    ContractsLoader.loadMachineContract(
      this.web3,
      this.props.match.params.address
    )
      .then((result) => {
        this.getMachineReadings(result.metaMaskContract);
      })
      .catch((error) => {
        this.setState({ fatalError: error.message });
      });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.match.params.address !== nextProps.match.params.address) {
      this.getMachineReadings(nextProps.match.params.address);
    }
  }

  render() {
    if (this.state.fatalError) {
      return <ErrorPage errorMessage={this.state.fatalError} />;
    }
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.web3 = connectionContext.web3;
          return (
            <Page.Content
              title={
                <AddressResolver address={this.props.match.params.address} />
              }
              subTitle="A list of all sensors readings saved in the smart contract"
            >
              <Dimmer active={this.state.loading} loader>
                <Grid.Row>
                  <Grid.Col>
                    <Card>
                      <Card.Header isFullscreenable>
                        <Card.Title>Machine Readings</Card.Title>
                        <Card.Options>
                          <Button outline color="success" size="sm">
                            Request Reading
                          </Button>
                        </Card.Options>
                      </Card.Header>
                      <Card.Body>
                        {this.state.readings.length === 0 ? (
                          <div className="emptyListStatus">
                            {"No Readings."}
                          </div>
                        ) : (
                          <Table>
                            <Table.Header>
                              <Table.Row>
                                <Table.ColHeader alignContent="center">
                                  ID
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Type
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Value
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Time of Measure
                                </Table.ColHeader>
                                <Table.ColHeader alignContent="center">
                                  Task ID
                                </Table.ColHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {this.state.readings.map((reading, i) => (
                                <Table.Row key={reading.ID}>
                                  <Table.Col alignContent="center">
                                    {reading.ID}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {this.ReadingsType[reading.type]}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {reading.value}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {reading.time}
                                  </Table.Col>
                                  <Table.Col alignContent="center">
                                    {reading.taskID}
                                  </Table.Col>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  </Grid.Col>
                </Grid.Row>
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default withRouter(MachineReadings);
