// @flow

import * as React from "react";

import { Grid, Card, Page, Form, Button, Dropdown, Dimmer } from "tabler-react";
import EventsTable from "./EventsTable";
import ConnectionContext from "../utilities/ConnectionContext";
import Select from "react-select";
import ContractsLoader from "../utilities/ContractsLoader";

const eventsTypes = [
  {
    label: "Machine Contract Events",
    options: [
      {
        value: "TaskAssigned",
        label: "Task Assigned Event",
        type: "machine",
      },
      {
        value: "TaskStarted",
        label: "Task Started Event",
        type: "machine",
      },
      {
        value: "TaskFinished",
        label: "Task Finished Event",
        type: "machine",
      },
      {
        value: "TaskKilled",
        label: "Task Killed Event",
        type: "machine",
      },
      {
        value: "ProductOperationSaved",
        label: "Product Operation Saved Event",
        type: "machine",
      },
      {
        value: "NewReading",
        label: "New Reading Event",
        type: "machine",
      },
      {
        value: "NewAlert",
        label: "New Alert Event",
        type: "machine",
      },
    ],
  },
  {
    label: "Process Contract Events",
    options: [
      {
        value: "ProcessStepStarted",
        label: "Process Step Started Event",
        type: "process",
      },
      {
        value: "ProcessStarted",
        label: "Process Started Event",
        type: "process",
      },
      {
        value: "ProcessFinished",
        label: "Process Finished Event",
        type: "process",
      },
      {
        value: "ProcessKilled",
        label: "Process Killed Event",
        type: "process",
      },
    ],
  },
];

class EventsExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contractsInfos: [],
      rows: [],
      showTable: false,
      findButtonEnable: false,
      loading: false,
    };
  }

  componentDidMount() {
    document.title = "Events Log Explorer";
    this.getMachinesList();
    this.getProcessList();
  }

  async getMachinesList() {
    try {
      let contractsCount = await this.registry.methods
        .getMachineContractsCount()
        .call();
      let machinesContracts = [];
      for (let id = 0; id < contractsCount; id++) {
        let machineContractInfo = await this.registry.methods
          .getMachineContract(id)
          .call();
        machinesContracts.push({
          value: machineContractInfo[1],
          label: machineContractInfo[0],
          type: "machine",
        });
      }
      this.setState((state, props) => {
        return {
          contractsInfos: [
            ...this.state.contractsInfos,
            { label: "Machines Contracts", options: machinesContracts },
          ],
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getProcessList() {
    try {
      let contractsCount = await this.registry.methods
        .getProcessesContractsCount()
        .call();
      let processesContracts = [];
      for (let id = 0; id < contractsCount; id++) {
        let processContractInfo = await this.registry.methods
          .getProcessContract(id)
          .call();
        processesContracts.push({
          value: processContractInfo[1],
          label: processContractInfo[0],
          type: "process",
        });
      }
      this.setState((state, props) => {
        return {
          contractsInfos: [
            ...this.state.contractsInfos,
            { label: "Process Contracts", options: processesContracts },
          ],
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  checkInput() {
    console.log(this.state);
    if (this.state.chosenContract == null) {
      this.setState({ findButtonEnable: false });
      return;
    }
    if (this.state.chosenEvents == null) {
      this.setState({ findButtonEnable: false });
      return;
    }
    if (this.state.fromBlock == null || this.state.fromBlock === "") {
      this.setState({ findButtonEnable: false });
      return;
    }
    if (this.state.toBlock == null || this.state.toBlock === "") {
      this.setState({ findButtonEnable: false });
      return;
    }
    this.setState({ findButtonEnable: true });
  }

  handleContractSelect(selectedOption) {
    this.setState({ chosenContract: selectedOption }, () => {
      this.checkInput();
    });
  }

  handleEventsSelect(selectedOption) {
    this.setState({ chosenEvents: selectedOption }, () => {
      this.checkInput();
    });
  }

  onFromBlockChanged(event) {
    let fromBlock = event.target.value.trim();
    this.setState({ fromBlock: fromBlock }, () => {
      this.checkInput();
    });
  }

  onToBlockChanged(event) {
    let toBlock = event.target.value.trim();
    this.setState({ toBlock: toBlock }, () => {
      this.checkInput();
    });
  }

  async loadEventForContract(contractName, contract, eventName) {
    contract.getPastEvents(
      eventName,
      {
        filter: {},
        fromBlock: this.state.fromBlock,
        toBlock: this.state.toBlock,
      },
      (error, events) => {
        if (error) {
          console.log(error);
        } else {
          this.onNewEvents(contractName, events);
        }
      }
    );
  }

  onNewEvents(contractName, ethereumEvents) {
    var rows = [];
    ethereumEvents.forEach((ethereumEvent) => {
      rows.push({
        contractName: contractName,
        _id: ethereumEvent.transactionHash + ethereumEvent.id,
        payload: ethereumEvent,
        eventName: ethereumEvent.event,
        blockNumber: ethereumEvent.blockNumber,
        transactionHash: ethereumEvent.transactionHash,
      });
    });
    this.setState((state, props) => {
      return {
        rows: rows,
        loading: false,
        showTable: true,
      };
    });
  }

  async loadEventsForContract(contractName, contract, events) {
    events.forEach((event) => {
      this.loadEventForContract(contractName, contract, event.value);
    });
  }

  async loadEventsForContracts(chosenContract, chosenEvents) {
    let machineEvents = chosenEvents.filter(function (event) {
      return event.type === "machine";
    });
    let processEvents = chosenEvents.filter(function (event) {
      return event.type === "process";
    });
    if (chosenContract.type === "machine") {
      let machineContract = await ContractsLoader.loadMachineContract(
        this.web3,
        chosenContract.value
      );
      this.loadEventsForContract(
        chosenContract.label,
        machineContract.wsContract,
        machineEvents
      );
    }
    if (chosenContract.type === "process") {
      let processContract = await ContractsLoader.loadProcessContract(
        this.web3,
        chosenContract.value
      );
      this.loadEventsForContract(
        chosenContract.label,
        processContract.wsContract,
        processEvents
      );
    }
  }

  onFindClick() {
    let chosenContract = this.state.chosenContract;
    let chosenEvents = this.state.chosenEvents;
    this.loadEventsForContracts(chosenContract, chosenEvents);
    this.setState({ loading: true, showTable: true });
  }

  setPredefinedBlock(predefinedBlockName, inputName) {
    Array.from(document.querySelectorAll(`[name=${inputName}]`)).forEach(
      (input) => (input.value = predefinedBlockName)
    );
    if (inputName === "fromBlock") {
      this.onFromBlockChanged({
        target: { value: predefinedBlockName },
      });
    } else {
      this.onToBlockChanged({
        target: { value: predefinedBlockName },
      });
    }
  }

  render() {
    return (
      <ConnectionContext.Consumer>
        {(connectionContext) => {
          this.registry = connectionContext.registry;
          this.web3 = connectionContext.web3;
          return (
            <Page.Content title="Events Log Explorer">
              <Grid.Row>
                <Grid.Col>
                  <Card
                    title="Events Log Search Options"
                    isFullscreenable
                    isClosable
                    isCollapsible
                  >
                    <Card.Body>
                      <Form.Group label="Smart Contracts">
                        <Select
                          styles={{
                            menu: (styles) =>
                              Object.assign(styles, { zIndex: 1000 }),
                          }}
                          placeholder="Select contract"
                          onChange={this.handleContractSelect.bind(this)}
                          options={this.state.contractsInfos}
                        />
                      </Form.Group>
                      <Form.Group label="Contract Events">
                        <Select
                          placeholder="Select one or events"
                          isMulti
                          styles={{
                            menu: (styles) =>
                              Object.assign(styles, { zIndex: 1000 }),
                          }}
                          onChange={this.handleEventsSelect.bind(this)}
                          options={eventsTypes}
                        />
                      </Form.Group>
                      <Grid.Row>
                        <Grid.Col sm={6}>
                          <Form.Group label="From Block">
                            <Form.InputGroup>
                              <Form.Input
                                placeholder="Block number or predefined (earliest, latest, or pending)"
                                name="fromBlock"
                                onChange={this.onFromBlockChanged.bind(this)}
                              />
                              <Form.InputGroup append>
                                <Button.Dropdown color="primary">
                                  <Dropdown.Item
                                    onClick={() =>
                                      this.setPredefinedBlock(
                                        "earliest",
                                        "fromBlock"
                                      )
                                    }
                                  >
                                    Earliest Block
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      this.setPredefinedBlock(
                                        "latest",
                                        "fromBlock"
                                      )
                                    }
                                  >
                                    Latest Block
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      this.setPredefinedBlock(
                                        "pending",
                                        "fromBlock"
                                      )
                                    }
                                  >
                                    Pending Block
                                  </Dropdown.Item>
                                </Button.Dropdown>
                              </Form.InputGroup>
                            </Form.InputGroup>
                          </Form.Group>
                        </Grid.Col>
                        <Grid.Col sm={6}>
                          <Form.Group label="To Block">
                            <Form.InputGroup>
                              <Form.Input
                                placeholder="Block number or predefined (earliest, latest, or pending)"
                                name="toBlock"
                                onChange={this.onToBlockChanged.bind(this)}
                              />
                              <Form.InputGroup append>
                                <Button.Dropdown color="primary">
                                  <Dropdown.Item
                                    onClick={() =>
                                      this.setPredefinedBlock(
                                        "earliest",
                                        "toBlock"
                                      )
                                    }
                                  >
                                    Earliest Block
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      this.setPredefinedBlock(
                                        "latest",
                                        "toBlock"
                                      )
                                    }
                                  >
                                    Latest Block
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      this.setPredefinedBlock(
                                        "pending",
                                        "toBlock"
                                      )
                                    }
                                  >
                                    Pending Block
                                  </Dropdown.Item>
                                </Button.Dropdown>
                              </Form.InputGroup>
                            </Form.InputGroup>
                          </Form.Group>
                        </Grid.Col>
                      </Grid.Row>
                    </Card.Body>
                    <Card.Footer>
                      <div align="right">
                        <Button
                          size="sm"
                          disabled={!this.state.findButtonEnable}
                          color="primary"
                          onClick={this.onFindClick.bind(this)}
                        >
                          Find
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Grid.Col>
              </Grid.Row>
              <Dimmer active={this.state.loading} loader>
                {this.state.showTable && (
                  <Grid.Row>
                    <Grid.Col>
                      <Card
                        title="Events Result"
                        isCollapsible
                        isFullscreenable
                      >
                        <EventsTable
                          rows={this.state.rows}
                          emptyStateMessage={"No events found"}
                        />
                      </Card>
                    </Grid.Col>
                  </Grid.Row>
                )}
              </Dimmer>
            </Page.Content>
          );
        }}
      </ConnectionContext.Consumer>
    );
  }
}

export default EventsExplorer;
