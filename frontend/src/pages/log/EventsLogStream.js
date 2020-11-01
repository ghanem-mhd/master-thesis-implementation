// @flow

import * as React from "react";
import socketIOClient from "socket.io-client";

import {
  Page,
  Grid,
  Card
} from "tabler-react";

import EventsTable from './EventsTable';

class EventsLogStream extends React.Component {

    constructor(props) {
		super(props);
		this.state = {
			data: [],
		}
	}

    componentDidMount() {
        document.title = "Events Log - Stream"
        this.socket = socketIOClient(process.env.REACT_APP_BACKEND_BASE_URL);
		this.socket.on('event_log', log_event => {
            this.setState( (state, props) => {
                return {
                    data: [...this.state.data, log_event]
                };
            });
		});
    }

    componentWillUnmount(){
        this.socket.disconnect();
    }

    render () {
        return (
            <Page.Content title="Events Log - Stream">
                <Grid.Row>
                    <Grid.Col>
                        <Card title="Events" isCollapsible isFullscreenable>
                            <EventsTable data={this.state.data}/>
                        </Card>
                    </Grid.Col>
                </Grid.Row>
            </Page.Content>
        )
    }
}

export default EventsLogStream;
