// @flow

import * as React from "react";

import { Grid, Card } from "tabler-react";
import ConnectionContext from "../utilities/ConnectionContext";
import EventsTable from "./EventsTable";

class EventsLogStreamTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    ["VGR", "HBW", "SLD", "MPO"].forEach((machine) => {
      this.contracts[machine].events.TaskStarted(
        { fromBlock: "latest" },
        (error, event) => {
          this.onNewEvent(machine, error, event);
        }
      );

      this.contracts[machine].events.TaskFinished(
        { fromBlock: "latest" },
        (error, event) => {
          this.onNewEvent(machine, error, event);
        }
      );
    });
  }

  onNewEvent(contractName, error, ethereumEvent) {
    let row = {
      contractName: contractName,
    };
    if (error) {
      row.payload = error;
      row.eventName = "Error";
    } else {
      row.payload = ethereumEvent;
      row.eventName = ethereumEvent.event;
    }
    this.setState((state, props) => {
      return {
        rows: [...this.state.data, row],
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
