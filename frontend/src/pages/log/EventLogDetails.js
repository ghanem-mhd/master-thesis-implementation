
import * as React from "react";
import ReactJson from 'react-json-view'

class EventLogDetails extends React.Component {

    render(){
        return (
            <ReactJson src={this.props.data.payload}
                collapsed={3}
                name="Event Details"
                collapseStringsAfterLength={50}
                indentWidth={4}
            />
        )
    }

}

export default EventLogDetails;