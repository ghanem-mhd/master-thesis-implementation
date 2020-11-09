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
    this.socket.on("event_log", (log_event) => {
      this.setState((state, props) => {
        return {
          data: [...this.state.data, log_event],
        };
      });
    });
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.socket = connectionContext.socket;
          return (
            <Grid.Row>
              <Grid.Col>
                <Card title={this.props.title} isCollapsible isFullscreenable>
                  <EventsTable data={this.state.data} />
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
