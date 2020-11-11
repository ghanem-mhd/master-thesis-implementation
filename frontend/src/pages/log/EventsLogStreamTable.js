// @flow

import * as React from "react";

import { Grid, Card } from "tabler-react";
import ConnectionContext from "../utilities/ConnectionContext";
import EventsTable from "./EventsTable";

class EventsLogStreamTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: [],
    };
  }

  componentDidMount() {
    ["VGR", "HBW", "SLD", "MPO"].forEach((machine) => {
      this.contracts[machine].events.TaskStarted(
        { fromBlock: "latest" },
        (error, event) => {
          if (error) {
            console.log(error);
          } else {
            this.onNewEvent(machine, event);
          }
        }
      );
      this.contracts[machine].events.TaskFinished(
        { fromBlock: "latest" },
        (error, event) => {
          if (error) {
            console.log(error);
          } else {
            this.onNewEvent(machine, event);
          }
        }
      );
    });

    ["ProductionProcess", "SupplyingProcess"].forEach((process) => {
      this.contracts[process].events.ProcessStarted(
        { fromBlock: "latest" },
        (error, event) => {
          if (error) {
            console.log(error);
          } else {
            this.onNewEvent(process, event);
          }
        }
      );
      this.contracts[process].events.ProcessStepStarted(
        { fromBlock: "latest" },
        (error, event) => {
          if (error) {
            console.log(error);
          } else {
            this.onNewEvent(process, event);
          }
        }
      );
      this.contracts[process].events.ProcessFinished(
        { fromBlock: "latest" },
        (error, event) => {
          if (error) {
            console.log(error);
          } else {
            this.onNewEvent(process, event);
          }
        }
      );
    });
  }

  onNewEvent(contractName, ethereumEvent) {
    let row = {
      contractName: contractName,
      _id: ethereumEvent.transactionHash,
      payload: ethereumEvent,
      eventName: ethereumEvent.event,
      blockNumber: ethereumEvent.blockNumber,
      transactionHash: ethereumEvent.transactionHash,
    };
    this.setState((state, props) => {
      return {
        rows: [...this.state.rows, row],
      };
    });
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.contracts = connectionContext.wsContracts;
          return (
            <Grid.Row>
              <Grid.Col>
                <Card title={this.props.title} isCollapsible isFullscreenable>
                  <EventsTable rows={this.state.rows} />
                </Card>
              </Grid.Col>
            </Grid.Row>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default EventsLogStreamTable;
