import * as React from "react";
import { Table } from "tabler-react";
import DataTable from "react-data-table-component";

import EventLogDetails from "./EventLogDetails";

const columns = [
  {
    name: "Contract Name",
    cell: (row) => <Table.Col>{row.contractName}</Table.Col>,
    center: true,
    selector: "contractName",
    sortable: true,
  },
  {
    name: "Event Name",
    cell: (row) => <Table.Col>{row.eventName}</Table.Col>,
    center: true,
    selector: "eventName",
    sortable: true,
  },
  {
    name: "Block Number",
    cell: (row) => <Table.Col>{row.blockNumber}</Table.Col>,
    center: true,
    selector: "blockNumber",
    sortable: true,
  },
  {
    name: "Transaction Hash",
    cell: (row) => <Table.Col>{row.transactionHash}</Table.Col>,
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
        paginationPerPage={10}
        expandableRows
        noHeader={true}
        noDataComponent={<div className="emptyListStatus">{"No Events"}</div>}
        expandableRowDisabled={(row) => row.payload == null}
        expandableRowsComponent={<EventLogDetails />}
        paginationRowsPerPageOptions={[10, 20, 50, 100, 200]}
      />
    );
  }
}

export default EventsTable;
