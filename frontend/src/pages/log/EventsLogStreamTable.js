// @flow

import * as React from "react";
import socketIOClient from "socket.io-client";

import { Grid, Card } from "tabler-react";

import EventsTable from "./EventsTable";

class EventsLogStreamTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.socket = socketIOClient(process.env.REACT_APP_BACKEND_BASE_URL);
    this.socket.on("event_log", (log_event) => {
      this.setState((state, props) => {
        return {
          data: [...this.state.data, log_event],
        };
      });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return (
      <Grid.Row>
        <Grid.Col>
          <Card title={this.props.title} isCollapsible isFullscreenable>
            <EventsTable data={this.state.data} />
          </Card>
        </Grid.Col>
      </Grid.Row>
    );
  }
}

export default EventsLogStreamTable;
