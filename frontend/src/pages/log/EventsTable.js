import * as React from "react";
import DataTable from "react-data-table-component";

import EventLogDetails from "./EventLogDetails";

const columns = [
  {
    name: "Contract Name",
    selector: "contractName",
  },
  {
    name: "Event Name",
    selector: "eventName",
  },
];

class EventsTable extends React.Component {
  render() {
    return (
      <DataTable
        keyField="_id"
        columns={columns}
        data={this.props.rows}
        pagination={true}
        paginationPerPage={10}
        expandableRows
        noHeader={true}
        noDataComponent={<div className="emptyListStatus">{"No Events"}</div>}
        expandableRowDisabled={(row) => row.payload == null}
        expandableRowsComponent={<EventLogDetails />}
      />
    );
  }
}

export default EventsTable;
