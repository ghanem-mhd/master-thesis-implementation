// @flow

import * as React from "react";
import socketIOClient from "socket.io-client";
import DataTable from 'react-data-table-component';
import ReactJson from 'react-json-view'
import {
  Page
} from "tabler-react";

const ExpandableComponent = ({ data }) => <ReactJson src={data.payload} collapsed={3} name="Payload" collapseStringsAfterLength={30}/>;

class StreamLog extends React.Component {

    constructor(props) {
		super(props);
		this.state = {
			data: [],
		}
        this.counter = 1;
        this.columns = [
            {
                name: 'Location',
                selector: 'eventLocation'
            },
            {
                name: 'Description',
                selector: 'eventDescription'
            },
                {
                name: 'Timestamp',
                selector: 'eventTimestamp',
            },
        ];
	}

    componentDidMount() {
        document.title = "Stream Log";
        this.socket = socketIOClient("http://127.0.0.1:5000/");
		this.socket.on('log_event', log_event => {
            console.log(log_event);
            this.setState( (state, props) => {
                log_event.id = this.counter;
                this.counter++;
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
        console.log(this.state);
        return (
            <Page.Content title="Stream Log">
                <DataTable
                    columns={this.columns}
                    data={this.state.data}
                    pagination={true}
                    paginationPerPage={10}
                    expandableRows
                    expandableRowsComponent={<ExpandableComponent />}
                />
            </Page.Content>
        )
    }
}

export default StreamLog;
