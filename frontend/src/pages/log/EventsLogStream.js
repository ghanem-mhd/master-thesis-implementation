// @flow

import * as React from "react";

import { Page } from "tabler-react";

import EventsLogStreamTable from "./EventsLogStreamTable";

class EventsLogStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    document.title = "Events Log - Stream";
  }

  render() {
    return (
      <Page.Content title="Events Log - Stream">
        <EventsLogStreamTable title="Events" />
      </Page.Content>
    );
  }
}

export default EventsLogStream;
