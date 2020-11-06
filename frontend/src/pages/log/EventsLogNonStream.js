// @flow

import * as React from "react";

import { Page, Grid, Card } from "tabler-react";

import EventsTable from "./EventsTable";

const EVENTS_LOG_URL = process.env.REACT_APP_BACKEND_BASE_URL + "events";

class EventsLogNonStream extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    document.title = "Events Log - Non Stream";
    fetch(EVENTS_LOG_URL)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ data: data });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ data: [] });
      });
  }

  render() {
    return (
      <Page.Content title="Events Log - Non Stream">
        <Grid.Row>
          <Grid.Col>
            <Card title="Events" isCollapsible isFullscreenable>
              <EventsTable data={this.state.data} />
            </Card>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    );
  }
}

export default EventsLogNonStream;
