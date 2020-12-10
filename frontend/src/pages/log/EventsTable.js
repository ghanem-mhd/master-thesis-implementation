import * as React from "react";
import DataTable from "react-data-table-component";

import EventLogDetails from "./EventLogDetails";

const columns = [
  {
    name: "Contract Name",
    center: true,
    selector: "contractName",
    sortable: true,
  },
  {
    name: "Event Name",
    center: true,
    selector: "eventName",
    sortable: true,
  },
  {
    name: "Block Number",
    center: true,
    selector: "blockNumber",
    sortable: true,
  },
  {
    name: "Transaction Hash",
    left: true,
    grow: 3,
    selector: "transactionHash",
    sortable: true,
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
        paginationPerPage={5}
        expandableRows
        noHeader={true}
        noDataComponent={<div className="emptyListStatus">{"No Events"}</div>}
        expandableRowDisabled={(row) => row.payload == null}
        expandableRowsComponent={<EventLogDetails />}
        paginationRowsPerPageOptions={[5, 10, 20, 50, 100, 200]}
      />
    );
  }
}

export default EventsTable;
