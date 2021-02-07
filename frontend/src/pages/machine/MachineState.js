import React from "react";
import { Link } from "react-router-dom";
import { Grid, Avatar, Card } from "tabler-react";
import ContractsLoader from "../utilities/ContractsLoader";
import ProductDIDResolver from "../utilities/ProductDIDResolver";

function getStateElement(state) {
  // eslint-disable-next-line
  let className = "";
  let stateLabel = "";
  if (state === -1) {
    className = "status-icon bg-danger";
    stateLabel = "Discontented";
  }
  if (state === 0) {
    className = "status-icon bg-warning";
    stateLabel = "Idle";
  }
  if (state === 1) {
    className = "status-icon bg-success";
    stateLabel = "Active";
  }
  return stateLabel;
}

function getStatusColor(state) {
  if (state === -1) {
    return "red";
  }
  if (state === 0) {
    return "yellow";
  }
  if (state === 1) {
    return "green";
  }
}

class MachineState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      machineState: 0,
      taskName: "-",
      taskID: "-",
      productDID: "-",
    };
    this.initialState = this.state;
  }

  async componentDidMount() {
    try {
      let machineContractAddress = await this.props.registry.methods
        .resolveName(this.props.machineName)
        .call();
      this.setState({ machineContractAddress: machineContractAddress });
      let result = await ContractsLoader.loadMachineContract(
        this.props.web3,
        machineContractAddress
      );
      this.setUpListeners(result.wsContract);
    } catch (error) {
      console.log(error);
      this.setState({ machineState: -1 });
    }
  }

  async setUpListeners(MachineContract) {
    MachineContract.events.TaskStarted(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          this.setState({ machineState: -1 });
        } else {
          this.setState({
            machineState: 1,
            taskID: event.returnValues["taskID"],
            productDID: (
              <ProductDIDResolver
                productDID={event.returnValues["productDID"]}
              />
            ),
            taskName: event.returnValues["taskName"],
          });
        }
      }
    );
    MachineContract.events.TaskFinished(
      { fromBlock: "latest" },
      (error, event) => {
        if (error) {
          this.setState({ machineState: -1 });
        } else {
          this.setState(this.initialState);
        }
      }
    );
    MachineContract.methods
      .getSymbol()
      .call()
      .then((symbol) => {
        this.setState({ symbol: symbol });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <Card
        title={
          <Link
            to={"/machine/" + this.state.machineContractAddress}
            target="_blank"
          >
            {this.props.machineName}
          </Link>
        }
        statusColor={getStatusColor(this.state.machineState)}
        isFullscreenable
        isClosable
        isCollapsible
      >
        <Card.Body>
          <Grid.Row className="align-items-center">
            <Grid.Col auto>
              <Avatar
                className="imageSquare2"
                size="xxl"
                imageURL={"/" + this.state.symbol + ".jpg"}
              />
            </Grid.Col>
            <Grid.Col className="align-self-center">
              {[
                {
                  title: "Machine Status:",
                  content: getStateElement(this.state.machineState),
                },
                { title: "Task ID:", content: this.state.taskID },
                { title: "Task Name:", content: this.state.taskName },
                {
                  title: "Product:",
                  content: this.state.productDID,
                },
              ].map((d, i) => (
                <Grid.Row key={i}>
                  <Grid.Col sm={4}>
                    <b>{d.title} </b>
                  </Grid.Col>
                  <Grid.Col sm={8} className="text-center">
                    {d.content}
                  </Grid.Col>
                </Grid.Row>
              ))}
            </Grid.Col>
          </Grid.Row>
        </Card.Body>
      </Card>
    );
  }
}

export default MachineState;
